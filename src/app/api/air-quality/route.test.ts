import { describe, it, expect } from 'vitest';
import { NextRequest } from 'next/server';
import { GET } from './route';

describe('GET /api/air-quality validation', () => {
  it('returns HTTP 400 when latitude and longitude are missing', async () => {
    const req = new NextRequest('http://localhost:3000/api/air-quality');
    const res = await GET(req);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe('Invalid query parameters');
  });

  it('returns HTTP 400 when latitude or longitude is empty', async () => {
    const req = new NextRequest('http://localhost:3000/api/air-quality?latitude=&longitude=77.2');
    const res = await GET(req);
    expect(res.status).toBe(400);
  });

  it('returns HTTP 400 when coordinates are out of range or non-numeric', async () => {
    const req = new NextRequest('http://localhost:3000/api/air-quality?latitude=abc&longitude=200');
    const res = await GET(req);
    expect(res.status).toBe(400);
  });
});
