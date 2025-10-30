// src/auth/entities/user.entity.ts
import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Session } from './session.entity';
import { Account } from './account.entity';

@Entity('user')
export class User {
  @PrimaryColumn()
  id: string;

  @Column({ nullable: false })
  name: string;

  @Column({ unique: true, nullable: false })
  email: string;

  @Column({ name: 'email_verified', default: false })
  emailVerified: boolean;

  @Column({ nullable: true })
  image?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relations
  @OneToMany(() => Session, (session) => session.user, { cascade: true })
  sessions: Session[];

  @OneToMany(() => Account, (account) => account.user, { cascade: true })
  accounts: Account[];
}
