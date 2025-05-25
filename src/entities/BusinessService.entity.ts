import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { IsUUID } from 'class-validator';
import { BusinessProfile } from './BusinessProfile.entity';
import { ServiceType } from './ServiceType.entity';

@Entity('business_services')
export class BusinessService {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @IsUUID()
  business_id: string;

  @Column()
  @IsUUID()
  service_type_id: string;

  @CreateDateColumn()
  created_at: Date;

  @ManyToOne(() => BusinessProfile, business => business.services)
  @JoinColumn({ name: 'business_id' })
  business: BusinessProfile;

  @ManyToOne(() => ServiceType, serviceType => serviceType.business_services)
  @JoinColumn({ name: 'service_type_id' })
  service_type: ServiceType;
}