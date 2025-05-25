import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToOne, JoinColumn, OneToMany } from 'typeorm';
import { IsString, IsOptional, IsPhoneNumber, IsUUID } from 'class-validator';
import { User } from './User.entity';
import { CustomerAddress } from './CustomerAddress.entity';

@Entity('customer_profiles')
export class CustomerProfile {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @IsUUID()
  user_id: string;

  @Column()
  @IsString()
  first_name: string;

  @Column()
  @IsString()
  last_name: string;

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
  profile_photo_url: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @OneToOne(() => User, user => user.customer_profile)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @OneToMany(() => CustomerAddress, address => address.customer)
  addresses: CustomerAddress[];
}