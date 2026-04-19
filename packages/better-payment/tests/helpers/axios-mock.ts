import { vi } from 'vitest';

/**
 * Axios mock for UNIT tests only
 * DO NOT use this in integration tests
 */

export const mockAxios = {
  create: vi.fn(() => mockAxios),
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  delete: vi.fn(),
  patch: vi.fn(),
  request: vi.fn(),
  interceptors: {
    request: {
      use: vi.fn(),
      eject: vi.fn(),
    },
    response: {
      use: vi.fn(),
      eject: vi.fn(),
    },
  },
};

export const resetAxiosMocks = () => {
  mockAxios.get.mockReset();
  mockAxios.post.mockReset();
  mockAxios.put.mockReset();
  mockAxios.delete.mockReset();
  mockAxios.patch.mockReset();
  mockAxios.request.mockReset();
};

export const setupAxiosMock = (
  method: 'get' | 'post' | 'put' | 'delete' | 'patch',
  response: any,
  status = 200,
) => {
  mockAxios[method].mockResolvedValue({
    data: response,
    status,
    statusText: status === 200 ? 'OK' : 'Error',
    headers: {},
    config: {},
  });
};

export const setupAxiosError = (
  method: 'get' | 'post' | 'put' | 'delete' | 'patch',
  errorMessage: string,
  status = 500,
) => {
  mockAxios[method].mockRejectedValue({
    response: {
      data: { errorMessage },
      status,
      statusText: 'Error',
    },
    message: errorMessage,
  });
};

// Only mock axios in unit test environment
vi.mock('axios', () => ({
  default: mockAxios,
}));
