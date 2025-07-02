// Environment configuration for different deployment environments

export const config = {
  // API Base URL - will be different for each environment
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 
    (import.meta.env.DEV ? '/api' : 'https://www.main-bvxea6i-fru7lrwunilmo.au.platformsh.site/api'),
  
  // Kakao Map API Key (deprecated - now handled by server)
  kakaoApiKey: import.meta.env.VITE_KAKAO_API_KEY || '',
  
  // Environment
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
  
  // Application settings
  app: {
    name: '영업 상권 정보 시스템',
    version: '1.0.0'
  },
  
  // API settings
  api: {
    timeout: 30000, // 30 seconds
    retries: 3
  }
}

// Validate required environment variables
if (config.isProduction && !config.apiBaseUrl) {
  console.error('VITE_API_BASE_URL is required in production')
}