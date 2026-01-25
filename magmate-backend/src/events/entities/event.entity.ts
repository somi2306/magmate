import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { Favorite } from './favorite.entity';

export enum EventType {
  EVENT = 'EVENT',
  ACTIVITY = 'ACTIVITY',
}

export enum EventStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

@Entity()
export class Event {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'varchar' })
  city: string;

  @Column({ type: 'varchar' })
  lieu: string;

  @Column({
    type: 'enum',
    enum: EventType,
  })
  type: EventType;

  @Column({ type: 'timestamp' })
  date: Date;

  @Column({ type: 'varchar', nullable: true })
  imageUrl?: string;

  @Column({
    type: 'enum',
    enum: EventStatus,
    default: EventStatus.PENDING,
  })
  status: EventStatus;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => User, (user) => user.events)
  createdBy: User;

  @OneToMany(() => Favorite, (favorite) => favorite.event)
  favorites: Favorite[];
}