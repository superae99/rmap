import 'reflect-metadata'
import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { AppDataSource } from './config/database'
import authRoutes from './routes/auth.routes'
import partnerRoutes from './routes/partner.routes'
import areaRoutes from './routes/area.routes'
import salesTerritoryRoutes from './routes/sales-territory.routes'
import kakaoRoutes from './routes/kakao.routes'
import { errorHandler } from './middlewares/error.middleware'

dotenv.config()

// Platform.sh 환경변수 처리
if (process.env.PLATFORM_VARIABLES) {
  try {
    const platformVars = JSON.parse(Buffer.from(process.env.PLATFORM_VARIABLES, 'base64').toString())
    Object.assign(process.env, platformVars)
    console.log('Platform.sh variables loaded')
  } catch (error) {
    console.log('Failed to load Platform.sh variables:', error)
  }
}

const app = express()
const PORT = process.env.PORT || 5000

// Middleware
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173', // Vite dev server
  process.env.CORS_ORIGIN, // Production Netlify URL
].filter(Boolean)

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, etc.)
    if (!origin) return callback(null, true)
    
    if (allowedOrigins.includes(origin)) {
      return callback(null, true)
    }
    
    callback(new Error('Not allowed by CORS'))
  },
  credentials: true
}))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/partners', partnerRoutes)
app.use('/api/areas', areaRoutes)
app.use('/api/sales-territories', salesTerritoryRoutes)
app.use('/api/kakao', kakaoRoutes)

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
AppDataSource.initialize()
  .then(() => {
    console.log('Database connected successfully')
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`)
    })
  })
  .catch((error) => {
    console.error('Database connection error:', error)
    process.exit(1)
  })