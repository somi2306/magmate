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
import { Favorite } from './favorite.entity'; // Import de l'entité Favorite

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

  @Column()
  title: string;

  @Column('text')
  description: string;

  @Column()
  city: string;

  @Column()
  lieu: string;

  @Column({
    type: 'enum',
    enum: EventType,
  })
  type: EventType;

  @Column()
  date: Date;

  @Column({ nullable: true })
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

  @ManyToOne(() => User, (user) => user.events) // Relation avec l'utilisateur (créateur)
  createdBy: User;

  @OneToMany(() => Favorite, (favorite) => favorite.event)
  favorites: Favorite[];
}
