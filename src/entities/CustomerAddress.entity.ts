import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { IsString, IsBoolean, IsUUID } from 'class-validator';
import { CustomerProfile } from './CustomerProfile.entity';

@Entity('customer_addresses')
export class CustomerAddress {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @IsUUID()
  customer_id: string;

  @Column()
  @IsString()
  house: string;

  @Column()
  @IsString()
  street: string;

  @Column()
  @IsString()
  city: string;

  @Column({ default: false })
  @IsBoolean()
  is_default: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @ManyToOne(() => CustomerProfile, customer => customer.addresses)
  @JoinColumn({ name: 'customer_id' })
  customer: CustomerProfile;
}