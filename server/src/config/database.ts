import { DataSource } from 'typeorm'
import dotenv from 'dotenv'
import { User } from '../models/User'
import { Partner } from '../models/Partner'
import { Area } from '../models/Area'
import { SalesTerritory } from '../models/SalesTerritory'

dotenv.config()

export const AppDataSource = new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  username: process.env.DB_USERNAME || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_DATABASE || 'kakao_map_db',
  synchronize: process.env.NODE_ENV === 'development',
  logging: process.env.NODE_ENV === 'development',
  entities: [User, Partner, Area, SalesTerritory],
  migrations: ['src/migrations/*.ts'],
  subscribers: [],
})