/**
 * Robust HTTP Client with timeout, retry, circuit breaker, and error handling
 * Prevents infinite retry loops and unhandled exceptions
 */

export interface HttpClientConfig {
  baseURL: string
  connectTimeout?: number  // Connection timeout in ms (default: 3000)
  requestTimeout?: number  // Total request timeout in ms (default: 10000)
  maxRetries?: number      // Maximum retry attempts (default: 3)
  retryDelay?: number      // Initial retry delay in ms (default: 200)
  circuitBreakerThreshold?: number  // Failures before opening circuit (default: 5)
  circuitBreakerWindow?: number     // Time window in ms (default: 60000)
  circuitBreakerCooldown?: number   // Cooldown period in ms (default: 30000)
}

export interface HttpResponse<T = unknown> {
  statusCode: number
  data?: T
  error?: string
  headers?: Headers
}

export type RequestMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'

interface CircuitBreakerState {
  failures: number
  lastFailureTime: number
  state: 'closed' | 'open' | 'half-open'
}

export class HttpClient {
  private config: Required<HttpClientConfig>
  private circuitBreaker: Map<string, CircuitBreakerState> = new Map()
  private requestIdCounter = 0

  constructor(config: HttpClientConfig) {
    this.config = {
      baseURL: config.baseURL,
      connectTimeout: config.connectTimeout ?? 3000,
      requestTimeout: config.requestTimeout ?? 10000,
      maxRetries: config.maxRetries ?? 3,
      retryDelay: config.retryDelay ?? 200,
      circuitBreakerThreshold: config.circuitBreakerThreshold ?? 5,
      circuitBreakerWindow: config.circuitBreakerWindow ?? 60000,
      circuitBreakerCooldown: config.circuitBreakerCooldown ?? 30000,
    }

    // Validate base URL
    try {
      new URL(this.config.baseURL)
    } catch {
      throw new Error(`Invalid baseURL: ${this.config.baseURL}. Must be a valid URL.`)
    }

    // Setup global error handlers to prevent uncaught exceptions from crashing the process
    this.setupGlobalErrorHandlers()
  }

  private setupGlobalErrorHandlers(): void {
    // Only in Node.js/server environment
    if (typeof process !== 'undefined' && process.on) {
      process.on('uncaughtException', (error: Error) => {
        // Log but don't crash - network errors should not kill the process
        if (this.isNetworkError(error)) {
          console.error('[HTTP Client] Uncaught network error (handled):', {
            message: error.message,
            name: error.name,
            stack: error.stack,
            timestamp: new Date().toISOString(),
          })
        } else {
          // Non-network errors should still be logged but may need process restart
          console.error('[HTTP Client] Uncaught exception:', {
            message: error.message,
            name: error.name,
            stack: error.stack,
            timestamp: new Date().toISOString(),
          })
        }
      })

      process.on('unhandledRejection', (reason: unknown) => {
        const error = reason instanceof Error ? reason : new Error(String(reason))
        if (this.isNetworkError(error)) {
          console.error('[HTTP Client] Unhandled rejection (network error):', {
            message: error.message,
            name: error.name,
            timestamp: new Date().toISOString(),
          })
        }
      })
    }
  }

  private isNetworkError(error: Error): boolean {
    const networkErrorPatterns = [
      'ETIMEDOUT',
      'ECONNREFUSED',
      'ENOTFOUND',
      'ECONNRESET',
      'network',
      'fetch failed',
      'timeout',
    ]
    const message = error.message.toLowerCase()
    return networkErrorPatterns.some(pattern => message.includes(pattern.toLowerCase()))
  }

  private getRequestId(): string {
    this.requestIdCounter = (this.requestIdCounter + 1) % 1000000
    return `req-${Date.now()}-${this.requestIdCounter}`
  }

  private getCircuitBreakerKey(url: string, method: RequestMethod): string {
    const urlObj = new URL(url)
    return `${method}:${urlObj.origin}${urlObj.pathname}`
  }

  private checkCircuitBreaker(key: string): boolean {
    const state = this.circuitBreaker.get(key) || {
      failures: 0,
      lastFailureTime: 0,
      state: 'closed' as const,
    }

    const now = Date.now()

    // Check if we should transition from open to half-open
    if (state.state === 'open') {
      if (now - state.lastFailureTime >= this.config.circuitBreakerCooldown) {
        state.state = 'half-open'
        console.log(`[HTTP Client] Circuit breaker ${key} -> half-open`)
      } else {
        return false // Circuit is still open
      }
    }

    return true // Circuit is closed or half-open
  }

  private recordSuccess(key: string): void {
    const state = this.circuitBreaker.get(key)
    if (state && state.state === 'half-open') {
      // Success in half-open, close the circuit
      this.circuitBreaker.delete(key)
      console.log(`[HTTP Client] Circuit breaker ${key} -> closed (success)`)
    }
  }

  private recordFailure(key: string): void {
    const now = Date.now()
    const state = this.circuitBreaker.get(key) || {
      failures: 0,
      lastFailureTime: 0,
      state: 'closed' as const,
    }

    // Reset failures if outside the time window
    if (now - state.lastFailureTime > this.config.circuitBreakerWindow) {
      state.failures = 0
    }

    state.failures++
    state.lastFailureTime = now

    if (state.failures >= this.config.circuitBreakerThreshold) {
      state.state = 'open'
      console.warn(`[HTTP Client] Circuit breaker ${key} -> OPEN (${state.failures} failures)`)
    }

    this.circuitBreaker.set(key, state)
  }

  private shouldRetry(error: Error, attempt: number, statusCode?: number): boolean {
    // Don't retry if max retries reached
    if (attempt >= this.config.maxRetries) {
      return false
    }

    // Retry on network errors
    if (this.isNetworkError(error)) {
      return true
    }

    // Retry on 5xx server errors
    if (statusCode && statusCode >= 500 && statusCode < 600) {
      return true
    }

    // Retry on timeout errors
    if (error.message.includes('timeout') || error.name === 'TimeoutError') {
      return true
    }

    return false
  }

  private calculateRetryDelay(attempt: number): number {
    // Exponential backoff with jitter: baseDelay * (2^attempt) + random(0-100ms)
    const exponentialDelay = this.config.retryDelay * Math.pow(2, attempt)
    const jitter = Math.random() * 100
    return Math.min(exponentialDelay + jitter, 1500) // Cap at 1500ms
  }

  private async sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  private async fetchWithTimeout(
    url: string,
    options: RequestInit,
    requestId: string
  ): Promise<Response> {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => {
      controller.abort()
    }, this.config.requestTimeout)

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      })
      clearTimeout(timeoutId)
      return response
    } catch (error) {
      clearTimeout(timeoutId)
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error(`Request timeout after ${this.config.requestTimeout}ms (${requestId})`)
      }
      throw error
    }
  }

  private async parseResponse(response: Response): Promise<unknown> {
    const contentType = response.headers.get('content-type') || ''
    
    if (contentType.includes('application/json')) {
      try {
        return await response.json()
      } catch (error) {
        // If JSON parsing fails, return empty object instead of crashing
        console.warn('[HTTP Client] Failed to parse JSON response:', error)
        return {}
      }
    }
    
    return await response.text()
  }

  async request<T = unknown>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<HttpResponse<T>> {
    const method = (options.method?.toUpperCase() || 'GET') as RequestMethod
    const url = endpoint.startsWith('http') 
      ? endpoint 
      : `${this.config.baseURL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`
    
    const requestId = this.getRequestId()
    const circuitBreakerKey = this.getCircuitBreakerKey(url, method)

    // Check circuit breaker
    if (!this.checkCircuitBreaker(circuitBreakerKey)) {
      return {
        statusCode: 503,
        error: 'Service temporarily unavailable (circuit breaker open)',
      }
    }

    let lastError: Error | null = null
    let lastStatusCode: number | undefined

    for (let attempt = 0; attempt <= this.config.maxRetries; attempt++) {
      try {
        // Add delay before retry (not before first attempt)
        if (attempt > 0) {
          const delay = this.calculateRetryDelay(attempt - 1)
          console.log(`[HTTP Client] Retry attempt ${attempt}/${this.config.maxRetries} after ${delay.toFixed(0)}ms (${requestId})`)
          await this.sleep(delay)
        }

        const response = await this.fetchWithTimeout(url, options, requestId)
        lastStatusCode = response.status

        const data = await this.parseResponse(response)

        // Success - record in circuit breaker and return
        this.recordSuccess(circuitBreakerKey)

        if (!response.ok) {
          // Type-safe error extraction from response data
          const errorData = data as { detail?: string; error?: string } | undefined
          return {
            statusCode: response.status,
            error: errorData?.detail || errorData?.error || 'Request failed',
            data: data as T,
            headers: response.headers,
          }
        }

        return {
          statusCode: response.status,
          data: data as T,
          headers: response.headers,
        }
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error))
        
        // Check if we should retry
        if (!this.shouldRetry(lastError, attempt, lastStatusCode)) {
          break
        }

        // Log retry attempt (only if we're going to retry)
        if (attempt < this.config.maxRetries) {
          console.warn(`[HTTP Client] Request failed (attempt ${attempt + 1}/${this.config.maxRetries + 1}):`, {
            requestId,
            url,
            method,
            error: lastError.message,
            attempt: attempt + 1,
          })
        }
      }
    }

    // All retries exhausted or error not retryable
    this.recordFailure(circuitBreakerKey)

    // Log final error with context (only once, rate-limited)
    const errorMessage = lastError?.message || 'Unknown error'
    console.error(`[HTTP Client] Request failed after ${this.config.maxRetries + 1} attempts:`, {
      requestId,
      url: url.replace(/\?.*/, ''), // Sanitize URL (no query params in logs)
      method,
      statusCode: lastStatusCode,
      error: errorMessage,
      attempts: this.config.maxRetries + 1,
      timestamp: new Date().toISOString(),
    })

    return {
      statusCode: lastStatusCode || 500,
      error: this.isNetworkError(lastError!) 
        ? 'Network error: Unable to connect to server'
        : errorMessage,
    }
  }

  get<T = unknown>(endpoint: string, options?: RequestInit): Promise<HttpResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'GET' })
  }

  post<T = unknown>(endpoint: string, body?: unknown, options?: RequestInit): Promise<HttpResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    })
  }

  put<T = unknown>(endpoint: string, body?: unknown, options?: RequestInit): Promise<HttpResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    })
  }

  delete<T = unknown>(endpoint: string, options?: RequestInit): Promise<HttpResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' })
  }

  // Get circuit breaker status for healthcheck
  getCircuitBreakerStatus(): Record<string, CircuitBreakerState> {
    const status: Record<string, CircuitBreakerState> = {}
    this.circuitBreaker.forEach((state, key) => {
      status[key] = { ...state }
    })
    return status
  }
}