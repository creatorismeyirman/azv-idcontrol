/**
 * Environment variable validation and configuration
 * Fails fast if required environment variables are missing or invalid
 */

import { z } from 'zod'

const envSchema = z.object({
  NEXT_PUBLIC_API_BASE_URL: z
    .string()
    .url('NEXT_PUBLIC_API_BASE_URL must be a valid URL')
    .default('https://api.azvmotors.kz'),
})

export type EnvConfig = z.infer<typeof envSchema>

let envConfig: EnvConfig | null = null

/**
 * Get and validate environment configuration
 * Throws error if validation fails
 */
export function getEnvConfig(): EnvConfig {
  if (envConfig) {
    return envConfig
  }

  try {
    envConfig = envSchema.parse({
      NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
    })

    // Log sanitized config (no secrets)
    console.log('[Env Config] Validated configuration:', {
      NEXT_PUBLIC_API_BASE_URL: envConfig.NEXT_PUBLIC_API_BASE_URL,
      hasConfig: !!envConfig,
    })

    return envConfig
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')
      throw new Error(`Environment validation failed: ${errors}`)
    }
    throw error
  }
}

/**
 * Initialize environment validation at startup
 * Call this early in the application lifecycle
 */
export function initializeEnv(): void {
  try {
    getEnvConfig()
  } catch (error) {
    console.error('[Env Config] Failed to initialize environment:', error)
    if (typeof process !== 'undefined') {
      process.exit(1)
    }
    throw error
  }
}