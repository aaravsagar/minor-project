import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as firestore from 'firebase/firestore';
import { dealService } from '../src/services/dealService.js';
import { messageService } from '../src/services/messageService.js';

vi.mock('firebase/firestore', async () => {
  const actual = await vi.importActual('firebase/firestore');
  return {
    ...actual,
    collection: vi.fn((db, name) => ({ path: name })),
    doc: vi.fn((db, col, id) => ({ path: `${col}/${id}`, id })),
    query: vi.fn(),
    where: vi.fn(),
    getDocs: vi.fn(),
    updateDoc: vi.fn(),
    serverTimestamp: vi.fn(() => ({ type: 'serverTimestamp' })),
    runTransaction: vi.fn()
  };
});

vi.mock('../src/services/messageService.js', () => ({
  messageService: {
    getOrCreateConversation: vi.fn()
  }
}));

describe('Atomic Offer Acceptance in dealService.acceptOffer', () => {

  const mockBuyer = { uid: 'buyer_123', displayName: 'Rohit Sharma', email: 'rohit@test.com' };
  const mockRequirement = { id: 'req_101', title: 'iPhone 14', budget: 35000, buyerId: 'buyer_123' };
  const mockPitch = {
    id: 'pitch_201',
    requirementId: 'req_101',
    sellerId: 'seller_301',
    sellerName: 'Gujarat Electronics',
    offerPrice: 32000,
    deliveryTime: '2 days',
    condition: 'Good',
    status: 'pending'
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('atomically updates requirement, pitch, siblings and creates deal inside runTransaction', async () => {
    // Sibling queries prior to transaction
    firestore.getDocs.mockResolvedValueOnce({
      docs: [
        { id: 'pitch_201', data: () => mockPitch, ref: { id: 'pitch_201' } },
        { id: 'pitch_202', data: () => ({ ...mockPitch, id: 'pitch_202', status: 'pending' }), ref: { id: 'pitch_202' } }
      ]
    });

    const mockTransaction = {
      get: vi.fn((ref) => {
        if (ref.id === 'req_101') {
          return Promise.resolve({
            exists: () => true,
            data: () => ({ ...mockRequirement, status: 'active' })
          });
        }
        if (ref.id === 'pitch_201') {
          return Promise.resolve({
            exists: () => true,
            data: () => ({ ...mockPitch })
          });
        }
        if (ref.id === 'deal_req_101') {
          return Promise.resolve({
            exists: () => false
          });
        }
        if (ref.id === 'pitch_202') {
          return Promise.resolve({
            exists: () => true,
            data: () => ({ id: 'pitch_202', status: 'pending' })
          });
        }
        return Promise.resolve({ exists: () => false });
      }),
      update: vi.fn(),
      set: vi.fn()
    };

    firestore.runTransaction.mockImplementation(async (db, transactionCallback) => {
      return transactionCallback(mockTransaction);
    });

    messageService.getOrCreateConversation.mockResolvedValueOnce({ id: 'conv_req_101_seller_301' });

    const result = await dealService.acceptOffer({
      requirement: mockRequirement,
      pitch: mockPitch,
      buyer: mockBuyer
    });

    expect(result.dealId).toBe('deal_req_101');
    expect(result.conversationId).toBe('conv_req_101_seller_301');

    // Verify all transaction updates were staged atomically
    expect(mockTransaction.update).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'req_101' }),
      expect.objectContaining({ status: 'fulfilled', acceptedPitchId: 'pitch_201' })
    );

    expect(mockTransaction.update).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'pitch_201' }),
      expect.objectContaining({ status: 'accepted' })
    );

    expect(mockTransaction.update).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'pitch_202' }),
      expect.objectContaining({ status: 'rejected' })
    );

    expect(mockTransaction.set).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'deal_req_101' }),
      expect.objectContaining({
        dealPrice: 32000,
        pitchId: 'pitch_201',
        buyerId: 'buyer_123',
        sellerId: 'seller_301'
      })
    );
  });

  it('rejects acceptance if caller is not the requirement owner', async () => {
    firestore.getDocs.mockResolvedValueOnce({ docs: [] });

    const unauthorizedBuyer = { uid: 'buyer_imposter', displayName: 'Hacker' };

    const mockTransaction = {
      get: vi.fn((ref) => {
        if (ref.id === 'req_101') {
          return Promise.resolve({
            exists: () => true,
            data: () => ({ ...mockRequirement, buyerId: 'buyer_123', status: 'active' })
          });
        }
        return Promise.resolve({ exists: () => true, data: () => mockPitch });
      }),
      update: vi.fn(),
      set: vi.fn()
    };

    firestore.runTransaction.mockImplementation(async (db, transactionCallback) => {
      return transactionCallback(mockTransaction);
    });

    await expect(dealService.acceptOffer({
      requirement: mockRequirement,
      pitch: mockPitch,
      buyer: unauthorizedBuyer
    })).rejects.toThrow(/Unauthorized: Only the buyer who posted this requirement/);
  });

  it('prevents concurrent acceptance of two offers for the same requirement via deterministic deal document lock', async () => {
    firestore.getDocs.mockResolvedValueOnce({ docs: [] });

    // Existing deal doc already accepted with a different pitch
    const mockTransaction = {
      get: vi.fn((ref) => {
        if (ref.id === 'deal_req_101') {
          return Promise.resolve({
            exists: () => true,
            data: () => ({ pitchId: 'different_pitch_999' })
          });
        }
        if (ref.id === 'req_101') {
          return Promise.resolve({
            exists: () => true,
            data: () => ({ ...mockRequirement, status: 'active', buyerId: 'buyer_123' })
          });
        }
        return Promise.resolve({ exists: () => true, data: () => mockPitch });
      }),
      update: vi.fn(),
      set: vi.fn()
    };

    firestore.runTransaction.mockImplementation(async (db, transactionCallback) => {
      return transactionCallback(mockTransaction);
    });

    await expect(dealService.acceptOffer({
      requirement: mockRequirement,
      pitch: mockPitch,
      buyer: mockBuyer
    })).rejects.toThrow(/A deal has already been accepted for this requirement/);
  });

  it('safely handles idempotent retries for the same offer without creating duplicate deals', async () => {
    firestore.getDocs.mockResolvedValueOnce({ docs: [] });

    const mockTransaction = {
      get: vi.fn((ref) => {
        if (ref.id === 'deal_req_101') {
          return Promise.resolve({
            exists: () => true,
            data: () => ({ id: 'deal_req_101', pitchId: 'pitch_201' })
          });
        }
        if (ref.id === 'req_101') {
          return Promise.resolve({
            exists: () => true,
            data: () => ({ ...mockRequirement, status: 'active', buyerId: 'buyer_123' })
          });
        }
        return Promise.resolve({ exists: () => true, data: () => mockPitch });
      }),
      update: vi.fn(),
      set: vi.fn()
    };

    firestore.runTransaction.mockImplementation(async (db, transactionCallback) => {
      return transactionCallback(mockTransaction);
    });

    messageService.getOrCreateConversation.mockResolvedValueOnce({ id: 'conv_req_101_seller_301' });

    const result = await dealService.acceptOffer({
      requirement: mockRequirement,
      pitch: mockPitch,
      buyer: mockBuyer
    });

    expect(result.dealId).toBe('deal_req_101');
    expect(mockTransaction.set).not.toHaveBeenCalled();
  });

  it('preserves deal record if post-transaction conversation creation fails, marking conversationStatus failed for safe retry', async () => {
    firestore.getDocs.mockResolvedValueOnce({ docs: [] });

    const mockTransaction = {
      get: vi.fn((ref) => {
        if (ref.id === 'req_101') return Promise.resolve({ exists: () => true, data: () => ({ ...mockRequirement, status: 'active', buyerId: 'buyer_123' }) });
        if (ref.id === 'pitch_201') return Promise.resolve({ exists: () => true, data: () => mockPitch });
        return Promise.resolve({ exists: () => false });
      }),
      update: vi.fn(),
      set: vi.fn()
    };

    firestore.runTransaction.mockImplementation(async (db, transactionCallback) => {
      return transactionCallback(mockTransaction);
    });

    // Simulate network error during conversation creation
    messageService.getOrCreateConversation.mockRejectedValueOnce(new Error('Network error creating conversation'));

    const result = await dealService.acceptOffer({
      requirement: mockRequirement,
      pitch: mockPitch,
      buyer: mockBuyer
    });

    // Deal acceptance succeeded
    expect(result.dealId).toBe('deal_req_101');
    // Flagged in deal document for durable follow-up
    expect(firestore.updateDoc).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'deal_req_101' }),
      expect.objectContaining({ conversationStatus: 'failed' })
    );
  });
});
