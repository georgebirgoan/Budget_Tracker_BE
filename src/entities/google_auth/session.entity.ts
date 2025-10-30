// src/auth/entities/session.entity.ts
import {
  Entity,
  PrimaryColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity('session')
export class Session {
  @PrimaryColumn()
  id: string;

  @Column({ name: 'expires_at', nullable: false })
  expiresAt: Date;

  @Column({ unique: true, nullable: false })
  token: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Column({ name: 'ip_address', nullable: true })
  ipAddress?: string;

  @Column({ name: 'user_agent', nullable: true })
  userAgent?: string;

  @ManyToOne(() => User, (user) => user.sessions, {
    onDelete: 'CASCADE',
  })
  user: User;
}
