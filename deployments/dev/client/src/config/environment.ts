// Client environment configuration
export interface ClientEnvironmentConfig {
  env: string;
  apiUrl: string;
  apiTimeout: number;
  kakaoApiKey: string;
  features: {
    showDebugPanel: boolean;
    enableMockData: boolean;
    enableConsoleLog: boolean;
    enableTestBanner: boolean;
    enableAnalytics: boolean;
  };
  ui: {
    showEnvironmentBadge: boolean;
    environmentBadgeColor: string;
    maxMarkersToRender: number;
    enableClustering: boolean;
  };
}

const development: ClientEnvironmentConfig = {
  env: 'development',
  apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:5001/api',
  apiTimeout: parseInt(import.meta.env.VITE_API_TIMEOUT || '30000'),
  kakaoApiKey: import.meta.env.VITE_KAKAO_API_KEY || '',
  features: {
    showDebugPanel: true,
    enableMockData: true,
    enableConsoleLog: true,
    enableTestBanner: false,
    enableAnalytics: false,
  },
  ui: {
    showEnvironmentBadge: true,
    environmentBadgeColor: '#00ff00',
    maxMarkersToRender: 1000,
    enableClustering: false,
  },
};

const testing: ClientEnvironmentConfig = {
  env: 'testing',
  apiUrl: import.meta.env.VITE_API_URL || 'https://test-api.your-domain.com/api',
  apiTimeout: parseInt(import.meta.env.VITE_API_TIMEOUT || '30000'),
  kakaoApiKey: import.meta.env.VITE_KAKAO_API_KEY || '',
  features: {
    showDebugPanel: false,
    enableMockData: false,
    enableConsoleLog: false,
    enableTestBanner: true,
    enableAnalytics: false,
  },
  ui: {
    showEnvironmentBadge: true,
    environmentBadgeColor: '#ffaa00',
    maxMarkersToRender: 50000,
    enableClustering: true,
  },
};

const production: ClientEnvironmentConfig = {
  env: 'production',
  apiUrl: import.meta.env.VITE_API_URL || 'https://api.your-domain.com/api',
  apiTimeout: parseInt(import.meta.env.VITE_API_TIMEOUT || '30000'),
  kakaoApiKey: import.meta.env.VITE_KAKAO_API_KEY || '',
  features: {
    showDebugPanel: false,
    enableMockData: false,
    enableConsoleLog: false,
    enableTestBanner: false,
    enableAnalytics: true,
  },
  ui: {
    showEnvironmentBadge: false,
    environmentBadgeColor: '',
    maxMarkersToRender: 100000,
    enableClustering: true,
  },
};

const configs = {
  development,
  testing,
  production,
};

// Determine current environment
const currentEnv = (import.meta.env.VITE_ENV || import.meta.env.MODE || 'development') as keyof typeof configs;

export const clientConfig: ClientEnvironmentConfig = configs[currentEnv];

// Environment validation
if (!clientConfig) {
  // Fallback to development
  clientConfig = development;
}

// Required configuration validation
if (!clientConfig.kakaoApiKey) {
}

// Console log control
if (!clientConfig.features.enableConsoleLog && currentEnv !== 'development') {
}

// Export helper functions
export const isDevelopment = () => currentEnv === 'development';
export const isTesting = () => currentEnv === 'testing';
export const isProduction = () => currentEnv === 'production';

export default clientConfig;