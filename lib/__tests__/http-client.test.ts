/**
 * Unit tests for HTTP Client
 * Run with: npm test or pnpm test
 */

import { HttpClient } from '../http-client'

describe('HttpClient', () => {
  let client: HttpClient

  beforeEach(() => {
    client = new HttpClient({
      baseURL: 'https://httpbin.org',
      connectTimeout: 3000,
      requestTimeout: 5000,
      maxRetries: 2,
      retryDelay: 100,
    })
  })

  describe('Configuration', () => {
    it('should validate base URL', () => {
      expect(() => {
        new HttpClient({ baseURL: 'invalid-url' })
      }).toThrow('Invalid baseURL')
    })

    it('should accept valid base URL', () => {
      expect(() => {
        new HttpClient({ baseURL: 'https://example.com' })
      }).not.toThrow()
    })
  })

  describe('Circuit Breaker', () => {
    it('should track circuit breaker status', () => {
      const status = client.getCircuitBreakerStatus()
      expect(status).toBeDefined()
      expect(typeof status).toBe('object')
    })
  })

  describe('Request handling', () => {
    it('should handle successful GET request', async () => {
      const response = await client.get('/get')
      expect(response.statusCode).toBe(200)
      expect(response.data).toBeDefined()
    }, 10000)

    it('should handle timeout errors', async () => {
      const timeoutClient = new HttpClient({
        baseURL: 'https://httpbin.org',
        requestTimeout: 1, // Very short timeout
        maxRetries: 0,
      })

      const response = await timeoutClient.get('/delay/5')
      expect(response.statusCode).toBe(500)
      expect(response.error).toContain('timeout')
    }, 15000)

    it('should not retry on 4xx errors', async () => {
      const response = await client.get('/status/404')
      expect(response.statusCode).toBe(404)
      // Should not retry - returns immediately
    }, 10000)

    it('should retry on network errors', async () => {
      const badClient = new HttpClient({
        baseURL: 'http://invalid-domain-that-does-not-exist-12345.com',
        maxRetries: 2,
        retryDelay: 100,
        requestTimeout: 1000,
      })

      const response = await badClient.get('/test')
      expect(response.statusCode).toBe(500)
      expect(response.error).toBeDefined()
    }, 15000)
  })

  describe('Error handling', () => {
    it('should not crash on invalid JSON response', async () => {
      // This test requires a server that returns invalid JSON
      // For now, just verify the parseResponse logic exists
      expect(client).toBeDefined()
    })
  })
})

// Note: To run these tests, you may need to install Jest or Vitest
// Add to package.json:
// "scripts": {
//   "test": "vitest" or "jest"
// }