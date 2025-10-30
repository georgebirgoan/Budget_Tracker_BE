// src/auth/entities/account.entity.ts
import {
  Entity,
  PrimaryColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity('account')
export class Account {
  @PrimaryColumn()
  id: string;

  @Column({ name: 'account_id', nullable: false })
  accountId: string;

  @Column({ name: 'provider_id', nullable: false })
  providerId: string;

  @ManyToOne(() => User, (user) => user.accounts, {
    onDelete: 'CASCADE',
  })
  user: User;

  @Column({ name: 'access_token', nullable: true })
  accessToken?: string;

  @Column({ name: 'refresh_token', nullable: true })
  refreshToken?: string;

  @Column({ name: 'id_token', nullable: true })
  idToken?: string;

  @Column({ name: 'access_token_expires_at', nullable: true })
  accessTokenExpiresAt?: Date;

  @Column({ name: 'refresh_token_expires_at', nullable: true })
  refreshTokenExpiresAt?: Date;

  @Column({ nullable: true })
  scope?: string;

  @Column({ nullable: true })
  password?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
