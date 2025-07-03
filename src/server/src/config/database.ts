import { DataSource } from 'typeorm'
import dotenv from 'dotenv'
import { User } from '../models/User'
import { Partner } from '../models/Partner'
import { Area } from '../models/Area'
import { SalesTerritory } from '../models/SalesTerritory'

dotenv.config()

// Dynamic database configuration for Platform.sh
let dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  username: process.env.DB_USERNAME || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_DATABASE || 'kakao_map_db',
}

// Platform.sh provides database credentials in PLATFORM_RELATIONSHIPS
if (process.env.PLATFORM_RELATIONSHIPS) {
  try {
    const relationships = JSON.parse(Buffer.from(process.env.PLATFORM_RELATIONSHIPS, 'base64').toString())
    console.log('🔍 Platform.sh relationships keys:', Object.keys(relationships))
    
    const dbRelationship = relationships.database
    if (dbRelationship && dbRelationship[0]) {
      const db = dbRelationship[0]
      dbConfig = {
        host: db.host,
        port: db.port,
        username: db.username,
        password: db.password,
        database: db.path,
      }
      console.log('✅ Database config loaded from Platform.sh:', {
        host: db.host,
        port: db.port,
        username: db.username,
        database: db.path
      })
    }
  } catch (error) {
    console.error('Failed to parse PLATFORM_RELATIONSHIPS:', error)
  }
}

export const AppDataSource = new DataSource({
  type: 'mysql',
  host: dbConfig.host,
  port: dbConfig.port,
  username: dbConfig.username,
  password: dbConfig.password,
  database: dbConfig.database,
  synchronize: process.env.NODE_ENV !== 'production',
  logging: process.env.NODE_ENV === 'development',
  entities: [User, Partner, Area, SalesTerritory],
  migrations: ['src/migrations/*.ts'],
  subscribers: [],
})