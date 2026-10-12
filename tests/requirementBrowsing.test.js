import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as firestore from 'firebase/firestore';
import { requirementService } from '../src/services/requirementService.js';

vi.mock('firebase/firestore', async () => {
  const actual = await vi.importActual('firebase/firestore');
  return {
    ...actual,
    collection: vi.fn(() => ({ type: 'collection' })),
    query: vi.fn((col, ...constraints) => ({ type: 'query', constraints })),
    where: vi.fn((field, op, val) => ({ field, op, val })),
    getDocs: vi.fn(),
    doc: vi.fn(),
    addDoc: vi.fn(),
    updateDoc: vi.fn(),
    serverTimestamp: vi.fn(() => ({ type: 'serverTimestamp' }))
  };
});

describe('Requirement Browsing with Server-Side Firestore Filtering', () => {

  const sampleMockDocs = [
    {
      id: 'req_1',
      data: () => ({
        title: 'iPhone 14 128GB',
        description: 'Need good battery condition',
        categoryId: 'cat_mobiles',
        categoryName: 'Mobile Phones',
        budget: 35000,
        status: 'active',
        location: 'Ahmedabad',
        urgency: 'Within 1 week',
        createdAt: { seconds: 1000 }
      })
    },
    {
      id: 'req_2',
      data: () => ({
        title: 'MacBook Air M1',
        description: 'Space grey with charger',
        categoryId: 'cat_laptops',
        categoryName: 'Laptops',
        budget: 52000,
        status: 'active',
        location: 'Ahmedabad',
        urgency: 'Immediate',
        createdAt: { seconds: 2000 }
      })
    },
    {
      id: 'req_3',
      data: () => ({
        title: 'Samsung Galaxy S23',
        description: 'Need 256GB version',
        categoryId: 'cat_mobiles',
        categoryName: 'Mobile Phones',
        budget: 45000,
        status: 'active',
        location: 'Gandhinagar',
        urgency: 'This month',
        createdAt: { seconds: 1500 }
      })
    }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('applies category filter directly into Firestore query constraints', async () => {
    firestore.getDocs.mockResolvedValueOnce({
      docs: [sampleMockDocs[0], sampleMockDocs[2]]
    });

    const results = await requirementService.getActiveRequirements({
      categoryId: 'cat_mobiles'
    });

    // Check where constraints passed to Firestore query
    expect(firestore.where).toHaveBeenCalledWith('status', '==', 'active');
    expect(firestore.where).toHaveBeenCalledWith('categoryId', '==', 'cat_mobiles');
    expect(results.length).toBe(2);
    expect(results.every(r => r.categoryId === 'cat_mobiles')).toBe(true);
  });

  it('does not add category constraint when categoryId is "all" or omitted', async () => {
    firestore.getDocs.mockResolvedValueOnce({
      docs: sampleMockDocs
    });

    const resultsAll = await requirementService.getActiveRequirements({
      categoryId: 'all'
    });

    expect(firestore.where).toHaveBeenCalledWith('status', '==', 'active');
    expect(firestore.where).not.toHaveBeenCalledWith('categoryId', '==', 'all');
    expect(resultsAll.length).toBe(3);
  });

  it('always retains active-status constraint', async () => {
    firestore.getDocs.mockResolvedValueOnce({ docs: [] });

    await requirementService.getActiveRequirements();

    expect(firestore.where).toHaveBeenCalledWith('status', '==', 'active');
  });

  it('handles missing or optional category fields gracefully without crashing', async () => {
    const corruptDoc = {
      id: 'req_corrupt',
      data: () => ({
        title: 'Miscellaneous item',
        // missing categoryId, categoryName, budget
        status: 'active'
      })
    };

    firestore.getDocs.mockResolvedValueOnce({ docs: [corruptDoc] });

    const results = await requirementService.getActiveRequirements();
    expect(results.length).toBe(1);
    expect(results[0].categoryId).toBe('');
    expect(results[0].categoryName).toBe('General');
    expect(results[0].budget).toBe(0);
  });

  it('handles empty results and propagates Firestore errors cleanly', async () => {
    firestore.getDocs.mockResolvedValueOnce({ docs: [] });
    const empty = await requirementService.getActiveRequirements({ categoryId: 'cat_furniture' });
    expect(empty).toEqual([]);

    firestore.getDocs.mockRejectedValueOnce(new Error('Firestore connection timeout'));
    await expect(requirementService.getActiveRequirements()).rejects.toThrow('Firestore connection timeout');
  });

  it('applies secondary search keywords, location substring, and sorting correctly', async () => {
    firestore.getDocs.mockResolvedValueOnce({ docs: sampleMockDocs });

    // Search keyword
    const searchResults = await requirementService.getActiveRequirements({ search: 'macbook' });
    expect(searchResults.length).toBe(1);
    expect(searchResults[0].title).toContain('MacBook');

    // Budget max filter
    firestore.getDocs.mockResolvedValueOnce({ docs: sampleMockDocs });
    const budgetFiltered = await requirementService.getActiveRequirements({ maxBudget: 40000 });
    expect(budgetFiltered.length).toBe(1);
    expect(budgetFiltered[0].budget).toBeLessThanOrEqual(40000);

    // Sorting by budget descending
    firestore.getDocs.mockResolvedValueOnce({ docs: sampleMockDocs });
    const sortedHigh = await requirementService.getActiveRequirements({ sortBy: 'budget-high' });
    expect(sortedHigh[0].budget).toBe(52000);
    expect(sortedHigh[sortedHigh.length - 1].budget).toBe(35000);
  });
});
