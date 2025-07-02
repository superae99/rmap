// Environment-specific configuration
export interface EnvironmentConfig {
  env: string;
  port: number;
  apiUrl: string;
  corsOrigin: string;
  database: {
    host: string;
    port: number;
    username: string;
    password: string;
    database: string;
    logging: boolean;
    synchronize: boolean;
  };
  jwt: {
    secret: string;
    expiresIn: string;
  };
  redis?: {
    host: string;
    port: number;
    password?: string;
  };
  features: {
    enableMockData: boolean;
    enableDebugMode: boolean;
    enableTestAccounts: boolean;
    enableRateLimit: boolean;
    maxRequestsPerMinute: number;
  };
  logging: {
    level: string;
    format: string;
  };
}

const development: EnvironmentConfig = {
  env: 'development',
  port: parseInt(process.env.PORT || '5001'),
  apiUrl: 'http://localhost:5001',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    username: process.env.DB_USERNAME || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_DATABASE || 'kakao_map_db',
    logging: true,
    synchronize: true, // Auto-sync in dev only
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'dev_jwt_secret',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },
  features: {
    enableMockData: true,
    enableDebugMode: true,
    enableTestAccounts: true,
    enableRateLimit: false,
    maxRequestsPerMinute: 1000,
  },
  logging: {
    level: 'debug',
    format: 'dev',
  },
};

const testing: EnvironmentConfig = {
  env: 'testing',
  port: parseInt(process.env.PORT || '5001'),
  apiUrl: process.env.API_URL || 'https://test-api.your-domain.com',
  corsOrigin: process.env.CORS_ORIGIN || 'https://test.your-domain.com',
  database: {
    host: process.env.DB_HOST || 'mysql-test',
    port: parseInt(process.env.DB_PORT || '3306'),
    username: process.env.DB_USERNAME || 'test_user',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_DATABASE || 'kakao_map_test',
    logging: false,
    synchronize: false,
  },
  jwt: {
    secret: process.env.JWT_SECRET || '',
    expiresIn: process.env.JWT_EXPIRES_IN || '1d',
  },
  features: {
    enableMockData: false,
    enableDebugMode: false,
    enableTestAccounts: true,
    enableRateLimit: true,
    maxRequestsPerMinute: 200,
  },
  logging: {
    level: 'info',
    format: 'json',
  },
};

const production: EnvironmentConfig = {
  env: 'production',
  port: parseInt(process.env.PORT || '5001'),
  apiUrl: process.env.API_URL || 'https://api.your-domain.com',
  corsOrigin: process.env.CORS_ORIGIN || 'https://app.your-domain.com',
  database: {
    host: process.env.DB_HOST || 'mysql-prod',
    port: parseInt(process.env.DB_PORT || '3306'),
    username: process.env.DB_USERNAME || '',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_DATABASE || 'kakao_map_prod',
    logging: false,
    synchronize: false, // Never auto-sync in production
  },
  jwt: {
    secret: process.env.JWT_SECRET || '',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },
  redis: {
    host: process.env.REDIS_HOST || 'redis-prod',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD,
  },
  features: {
    enableMockData: false,
    enableDebugMode: false,
    enableTestAccounts: false,
    enableRateLimit: true,
    maxRequestsPerMinute: 100,
  },
  logging: {
    level: 'error',
    format: 'json',
  },
};

const configs = {
  development,
  testing,
  production,
};

const currentEnv = (process.env.NODE_ENV || 'development') as keyof typeof configs;

export const config: EnvironmentConfig = configs[currentEnv];

// Validation
if (!config) {
  throw new Error(`Invalid NODE_ENV: ${process.env.NODE_ENV}`);
}

// Check required environment variables in production
if (currentEnv === 'production') {
  const required = ['JWT_SECRET', 'DB_PASSWORD', 'DB_USERNAME'];
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
}

export default config;