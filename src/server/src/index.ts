import 'reflect-metadata'
import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import dotenv from 'dotenv'
import { AppDataSource } from './config/database'
import authRoutes from './routes/auth.routes'
import partnerRoutes from './routes/partner.routes'
import areaRoutes from './routes/area.routes'
import salesTerritoryRoutes from './routes/sales-territory.routes'
import kakaoRoutes from './routes/kakao.routes'
import adminRoutes from './routes/admin.routes'
import { errorHandler } from './middlewares/error.middleware'
import { generalRateLimit } from './middlewares/rate-limit.middleware'

dotenv.config()

// Platform.sh 환경변수 처리
if (process.env.PLATFORM_VARIABLES) {
  try {
    const platformVars = JSON.parse(Buffer.from(process.env.PLATFORM_VARIABLES, 'base64').toString())
    Object.assign(process.env, platformVars)
  } catch (error) {
  }
}

const app = express()
const PORT = process.env.PORT || 5000

// Middleware
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:4000', // Client dev server
  'http://localhost:4001', // Client dev server (alternative port)
  'http://localhost:5173', // Vite dev server
  'https://rtmarket.store', // Production domain
  'https://www.rtmarket.store', // Production domain with www
  'https://r0map.netlify.app', // Legacy Netlify URL (for transition period)
  process.env.CORS_ORIGIN, // Production URL (from env)
].filter(Boolean)

console.log('🌐 Allowed CORS origins:', allowedOrigins)

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, etc.)
    if (!origin) return callback(null, true)
    
    if (allowedOrigins.includes(origin)) {
      return callback(null, true)
    }
    
    console.log('🚫 CORS blocked origin:', origin)
    callback(new Error('Not allowed by CORS'))
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
  exposedHeaders: ['Set-Cookie']
}))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())

// 전체 애플리케이션에 일반 율제한 적용
app.use(generalRateLimit)

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/partners', partnerRoutes)
app.use('/api/areas', areaRoutes)
app.use('/api/sales-territories', salesTerritoryRoutes)
app.use('/api/kakao', kakaoRoutes)
app.use('/api/admin', adminRoutes)

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Debug endpoint for environment variables
app.get('/debug/env', (req, res) => {
  res.json({
    JWT_SECRET: process.env.JWT_SECRET ? 'defined' : 'undefined',
    NODE_ENV: process.env.NODE_ENV,
    PORT: process.env.PORT,
    PLATFORM_VARIABLES: process.env.PLATFORM_VARIABLES ? 'exists' : 'not exists'
  })
})

// Error handling
app.use(errorHandler)

// Database connection and server start
console.log('🚀 Starting server...')
console.log('📊 Environment:', process.env.NODE_ENV)
console.log('🔌 Port:', PORT)
console.log('🗄️ Database:', process.env.DB_DATABASE)

AppDataSource.initialize()
  .then(() => {
    console.log('✅ Database connected successfully')
    app.listen(PORT, () => {
      console.log(`🌟 Server is running on http://localhost:${PORT}`)
      console.log(`🏥 Health check: http://localhost:${PORT}/health`)
      console.log(`🔗 API base: http://localhost:${PORT}/api`)
    })
  })
  .catch((error) => {
    console.error('❌ Database connection failed:', error.message)
    console.error('Full error:', error)
    process.exit(1)
  })