// Environment configuration for different deployment environments

export const config = {
  // API Base URL - will be different for each environment
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001',
  
  // Kakao Map API Key
  kakaoApiKey: import.meta.env.VITE_KAKAO_API_KEY || '',
  
  // Environment
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
  
  // Application settings
  app: {
    name: '카카오맵 상권 관리 시스템',
    version: '1.0.0'
  },
  
  // API settings
  api: {
    timeout: 30000, // 30 seconds
    retries: 3
  }
}

// Validate required environment variables
if (config.isProduction && !config.kakaoApiKey) {
  console.error('VITE_KAKAO_API_KEY is required in production')
}

if (config.isProduction && !config.apiBaseUrl) {
  console.error('VITE_API_BASE_URL is required in production')
}