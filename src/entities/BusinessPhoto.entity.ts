import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { IsString, IsUUID } from 'class-validator';
import { BusinessProfile } from './BusinessProfile.entity';

@Entity('business_photos')
export class BusinessPhoto {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @IsUUID()
  business_id: string;

  @Column()
  @IsString()
  photo_url: string;

  @CreateDateColumn()
  created_at: Date;

  @ManyToOne(() => BusinessProfile, business => business.photos)
  @JoinColumn({ name: 'business_id' })
  business: BusinessProfile;
}