import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToOne, BeforeInsert, BeforeUpdate } from 'typeorm';
import { IsEmail, Length, IsEnum, IsBoolean, IsOptional, IsUUID, IsDate } from 'class-validator';
import bcrypt from 'bcrypt';
import { CustomerProfile } from './CustomerProfile.entity';
import { BusinessProfile } from './BusinessProfile.entity';

export enum UserRole {
  CUSTOMER = 'CUSTOMER',
  BUSINESS = 'BUSINESS',
  ADMIN = 'ADMIN'
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  @IsEmail()
  email: string;

  @Column()
  @Length(8, 100)
  password_hash: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.CUSTOMER
  })
  @IsEnum(UserRole)
  role: UserRole;

  @Column({ default: false })
  @IsBoolean()
  is_email_verified: boolean;

  @Column({ nullable: true })
  @IsOptional()
  verification_token: string;

  @Column({ nullable: true })
  @IsOptional()
  reset_password_token: string;

  @Column({ type: 'timestamp', nullable: true })
  @IsOptional()
  @IsDate()
  reset_password_expires: Date;

  @Column({ nullable: true })
  @IsOptional()
  google_id: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  @IsOptional()
  @IsDate()
  last_login: Date;

  @OneToOne(() => CustomerProfile, profile => profile.user)
  customer_profile: CustomerProfile;

  @OneToOne(() => BusinessProfile, profile => profile.user)
  business_profile: BusinessProfile;

  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword() {
    // Only hash the password if it's been modified
    if (this.password_hash && this.password_hash.substr(0, 4) !== '$2b$') {
      const salt = await bcrypt.genSalt(10);
      this.password_hash = await bcrypt.hash(this.password_hash, salt);
    }
  }

  // Method to validate password
  async validatePassword(password: string): Promise<boolean> {
    return bcrypt.compare(password, this.password_hash);
  }
}