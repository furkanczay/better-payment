import { describe, expect } from 'vitest';

/**
 * Helper utilities for validating HTTP requests in integration tests
 */

export interface CapturedRequest {
  url: string;
  method: string;
  headers: Record<string, string>;
  body: any;
}

export class RequestValidator {
  private requests: CapturedRequest[] = [];

  captureRequest(req: CapturedRequest) {
    this.requests.push(req);
  }

  getLastRequest(): CapturedRequest | undefined {
    return this.requests[this.requests.length - 1];
  }

  getAllRequests(): CapturedRequest[] {
    return [...this.requests];
  }

  clear() {
    this.requests = [];
  }

  assertRequestCount(expected: number) {
    expect(this.requests).toHaveLength(expected);
  }

  assertLastRequestUrl(expectedUrl: string) {
    const lastReq = this.getLastRequest();
    expect(lastReq?.url).toBe(expectedUrl);
  }

  assertLastRequestMethod(expectedMethod: string) {
    const lastReq = this.getLastRequest();
    expect(lastReq?.method).toBe(expectedMethod);
  }

  assertLastRequestHeader(headerName: string, expectedValue: string) {
    const lastReq = this.getLastRequest();
    expect(lastReq?.headers[headerName]).toBe(expectedValue);
  }

  assertLastRequestBody(expectedBody: any) {
    const lastReq = this.getLastRequest();
    expect(lastReq?.body).toEqual(expectedBody);
  }

  assertLastRequestBodyContains(partialBody: any) {
    const lastReq = this.getLastRequest();
    expect(lastReq?.body).toMatchObject(partialBody);
  }
}

/**
 * Validates Iyzico request format
 */
export function validateIyzicoRequest(request: CapturedRequest) {
  // Check authorization header exists
  expect(request.headers['Authorization']).toBeDefined();
  expect(request.headers['Authorization']).toMatch(/^IYZWS .+:.+$/);

  // Check required headers
  expect(request.headers['Content-Type']).toBe('application/json');
  expect(request.headers['x-iyzi-rnd']).toBeDefined();

  // Check body structure
  expect(request.body).toHaveProperty('locale');
  expect(request.body).toHaveProperty('conversationId');
}

/**
 * Validates PayTR request format
 */
export function validatePayTRRequest(request: CapturedRequest) {
  // Check content type
  expect(request.headers['Content-Type']).toBe('application/x-www-form-urlencoded');

  // Check body contains required fields
  expect(request.body).toHaveProperty('merchant_id');
  expect(request.body).toHaveProperty('paytr_token');
  expect(request.body).toHaveProperty('merchant_oid');
}

/**
 * Validates hash/signature in request
 */
export function validateRequestSignature(
  request: CapturedRequest,
  expectedHashField: string,
) {
  expect(request.body[expectedHashField]).toBeDefined();
  expect(typeof request.body[expectedHashField]).toBe('string');
  expect(request.body[expectedHashField].length).toBeGreaterThan(0);
}
