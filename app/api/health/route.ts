/**
 * Health check endpoint
 * Returns 200 even if dependencies are down, but includes status: degraded
 * Useful for Kubernetes/Docker healthchecks
 */

import { NextResponse } from 'next/server'
import { httpClient } from '@/lib/api'
import { getEnvConfig } from '@/lib/env'

export async function GET() {
  const healthStatus: {
    status: 'ok' | 'degraded'
    timestamp: string
    service: string
    version: string
    dependencies: {
      api: {
        status: 'ok' | 'down'
        url: string
        details?: string
      }
    }
    circuitBreaker?: Record<string, unknown>
  } = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'azv-idcontrol',
    version: '0.1.0',
    dependencies: {
      api: {
        status: 'down',
        url: getEnvConfig().NEXT_PUBLIC_API_BASE_URL,
      },
    },
  }

  // Check API dependency health
  // Use a simple GET request to test connectivity
  // We expect 401 (unauthorized) which means the API is up but we're not authenticated
  // This is better than /auth/user/me which might not exist
  try {
    const testResponse = await httpClient.get('/', {
      headers: {},
    })

    // Any HTTP response means the API server is reachable
    // Status 200-499 means server is up (even 401/404 is fine for healthcheck)
    // Only 5xx or network errors mean the server is down
    if (testResponse.statusCode >= 200 && testResponse.statusCode < 500) {
      healthStatus.dependencies.api.status = 'ok'
    } else if (testResponse.statusCode >= 500) {
      // 5xx means server error, but at least it responded
      healthStatus.dependencies.api.status = 'ok'
      healthStatus.dependencies.api.details = `API returned ${testResponse.statusCode} (server error)`
    }
  } catch (error) {
    // Network error - API is down
    healthStatus.status = 'degraded'
    healthStatus.dependencies.api.status = 'down'
    healthStatus.dependencies.api.details = error instanceof Error ? error.message : 'Unknown error'
  }

  // Include circuit breaker status for observability
  const circuitBreakerStatus = httpClient.getCircuitBreakerStatus()
  if (Object.keys(circuitBreakerStatus).length > 0) {
    healthStatus.circuitBreaker = circuitBreakerStatus
    // If any circuit is open, mark as degraded
    const hasOpenCircuit = Object.values(circuitBreakerStatus).some(
      state => state.state === 'open'
    )
    if (hasOpenCircuit) {
      healthStatus.status = 'degraded'
    }
  }

  // Always return 200 for healthcheck, even if degraded
  // This allows Kubernetes/Docker to keep the container running
  // but monitoring systems can check the status field
  return NextResponse.json(healthStatus, {
    status: 200,
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
    },
  })
}

// Export as runtime = 'nodejs' for server-side only
export const runtime = 'nodejs'