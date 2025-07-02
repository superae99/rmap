import { DataSource } from 'typeorm'
import dotenv from 'dotenv'
import { User } from '../models/User'
import { Partner } from '../models/Partner'
import { Area } from '../models/Area'
import { SalesTerritory } from '../models/SalesTerritory'
import { config } from './environment'

dotenv.config()

export const AppDataSource = new DataSource({
  type: 'mysql',
  host: config.database.host,
  port: config.database.port,
  username: config.database.username,
  password: config.database.password,
  database: config.database.database,
  synchronize: config.database.synchronize,
  logging: config.database.logging,
  entities: [User, Partner, Area, SalesTerritory],
  migrations: ['src/migrations/*.ts'],
  subscribers: [],
})