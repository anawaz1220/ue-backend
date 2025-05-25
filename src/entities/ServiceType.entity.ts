import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from 'typeorm';
import { IsString } from 'class-validator';
import { BusinessService } from './BusinessService.entity';

@Entity('service_types')
export class ServiceType {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @IsString()
  name: string;

  @CreateDateColumn()
  created_at: Date;

  @OneToMany(() => BusinessService, businessService => businessService.service_type)
  business_services: BusinessService[];
}