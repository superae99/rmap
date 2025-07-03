import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm'
import { TopoJSONTopology } from '../types/topojson.types'

@Entity('areas')
export class Area {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  name: string

  @Column('json', { nullable: true })
  coordinates: Array<{ lat: number; lng: number }>

  @Column('json', { nullable: true })
  topojson: TopoJSONTopology

  @Column({ nullable: true })
  color: string

  @Column({ nullable: true })
  strokeColor: string

  @Column('decimal', { precision: 3, scale: 1, nullable: true })
  strokeWeight: number

  @Column('decimal', { precision: 3, scale: 1, nullable: true })
  fillOpacity: number

  @Column({ nullable: true })
  description: string

  @Column({ length: 20, nullable: true, comment: '행정구역코드' })
  admCd: string

  @Column('json', { nullable: true })
  properties: Record<string, any>

  @Column({ type: 'boolean', default: true })
  isActive: boolean

  @Column({ length: 20, nullable: true, comment: '생성자 사번' })
  createdBy: string

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}