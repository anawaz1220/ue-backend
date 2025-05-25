import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToOne, JoinColumn, OneToMany } from 'typeorm';
import { IsString, IsOptional, IsPhoneNumber, IsUUID, IsNumber, IsLatitude, IsLongitude } from 'class-validator';
import { User } from './User.entity';
import { BusinessPhoto } from './BusinessPhoto.entity';
import { BusinessService } from './BusinessService.entity';

@Entity('business_profiles')
export class BusinessProfile {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @IsUUID()
  user_id: string;

  @Column()
  @IsString()
  business_name: string;

  @Column()
  @IsPhoneNumber()
  phone_number: string;

  @Column({ nullable: true })
  @IsOptional()
  @IsPhoneNumber()
  whatsapp_number: string;

  @Column({ nullable: true })
  @IsOptional()
  @IsString()
  instagram_id: string;

  @Column()
  @IsString()
  owner_name: string;

  @Column()
  @IsPhoneNumber()
  owner_phone: string;

  @Column()
  @IsString()
  building: string;

  @Column()
  @IsString()
  street: string;

  @Column()
  @IsString()
  city: string;

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  @IsOptional()
  @IsLatitude()
  latitude: number;

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  @IsOptional()
  @IsLongitude()
  longitude: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @OneToOne(() => User, user => user.business_profile)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @OneToMany(() => BusinessPhoto, photo => photo.business)
  photos: BusinessPhoto[];

  @OneToMany(() => BusinessService, service => service.business)
  services: BusinessService[];
}