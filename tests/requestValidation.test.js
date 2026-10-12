import { describe, it, expect, vi } from 'vitest';
import request from 'supertest';
import app from '../server/app.js';
import { requirementBackendService } from '../server/services/requirementBackendService.js';

describe('Express Request Validation for Requirements API', () => {

  const validPayload = {
    buyerId: 'buyer_test_123',
    buyerName: 'Amit Patel',
    title: 'Looking for Lenovo ThinkPad T14',
    description: 'Need a certified refurbished Lenovo ThinkPad with i7 and 16GB RAM in good working condition.',
    categoryId: 'cat_laptops',
    budget: 38000,
    quantity: 1,
    location: 'Ahmedabad',
    urgency: 'Within 1 week'
  };

  it('accepts a valid requirement request and returns HTTP 201', async () => {
    const res = await request(app)
      .post('/api/requirements')
      .send(validPayload);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toBeDefined();
    expect(res.body.data.budget).toBe(38000);
  });

  it('rejects a ₹200 laptop requirement below the category minimum with HTTP 400', async () => {
    const spy = vi.spyOn(requirementBackendService, 'createRequirement');

    const res = await request(app)
      .post('/api/requirements')
      .send({
        ...validPayload,
        categoryId: 'cat_laptops',
        budget: 200 // Unrealistic price for laptop (minimum is ₹5,000)
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe('Validation failed');
    expect(res.body.errors).toBeInstanceOf(Array);
    
    const budgetError = res.body.errors.find(e => e.field === 'budget');
    expect(budgetError).toBeDefined();
    expect(budgetError.message).toMatch(/Budget is below the permitted minimum/);

    // Verify no database write occurred
    expect(spy).not.toHaveBeenCalled();
    spy.mockRestore();
  });

  it('rejects negative budgets and zero budgets with HTTP 400', async () => {
    const resNegative = await request(app)
      .post('/api/requirements')
      .send({
        ...validPayload,
        budget: -5000
      });

    expect(resNegative.status).toBe(400);
    expect(resNegative.body.errors.some(e => e.field === 'budget')).toBe(true);

    const resZero = await request(app)
      .post('/api/requirements')
      .send({
        ...validPayload,
        budget: 0
      });

    expect(resZero.status).toBe(400);
    expect(resZero.body.errors.some(e => e.field === 'budget')).toBe(true);
  });

  it('rejects invalid numeric inputs such as NaN, Infinity, and non-numeric strings', async () => {
    const resNaN = await request(app)
      .post('/api/requirements')
      .send({
        ...validPayload,
        budget: 'not-a-number'
      });

    expect(resNaN.status).toBe(400);
    expect(resNaN.body.errors.some(e => e.field === 'budget')).toBe(true);

    const resInf = await request(app)
      .post('/api/requirements')
      .send({
        ...validPayload,
        budget: Infinity
      });

    expect(resInf.status).toBe(400);
    expect(resInf.body.errors.some(e => e.field === 'budget')).toBe(true);
  });

  it('rejects invalid quantities (negative, zero, decimal, or exceeding limit)', async () => {
    const resQtyNegative = await request(app)
      .post('/api/requirements')
      .send({
        ...validPayload,
        quantity: -2
      });

    expect(resQtyNegative.status).toBe(400);
    expect(resQtyNegative.body.errors.some(e => e.field === 'quantity')).toBe(true);

    const resQtyExceed = await request(app)
      .post('/api/requirements')
      .send({
        ...validPayload,
        quantity: 999999
      });

    expect(resQtyExceed.status).toBe(400);
    expect(resQtyExceed.body.errors.some(e => e.field === 'quantity')).toBe(true);
  });

  it('rejects missing required fields (title, categoryId, urgency, location)', async () => {
    const resMissing = await request(app)
      .post('/api/requirements')
      .send({
        buyerId: 'buyer_test_123',
        description: 'Missing title and category'
      });

    expect(resMissing.status).toBe(400);
    const fieldsWithErrors = resMissing.body.errors.map(e => e.field);
    expect(fieldsWithErrors).toContain('title');
    expect(fieldsWithErrors).toContain('categoryId');
    expect(fieldsWithErrors).toContain('budget');
    expect(fieldsWithErrors).toContain('location');
    expect(fieldsWithErrors).toContain('urgency');
  });

  it('rejects unsupported categories', async () => {
    const resBadCat = await request(app)
      .post('/api/requirements')
      .send({
        ...validPayload,
        categoryId: 'unsupported_alien_category_xyz'
      });

    expect(resBadCat.status).toBe(400);
    expect(resBadCat.body.errors.some(e => e.field === 'categoryId')).toBe(true);
  });
});
