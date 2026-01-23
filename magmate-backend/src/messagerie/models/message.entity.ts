import { User } from '../../user/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ConversationEntity } from './conversation.entity';

export interface IMessage {
  id?: string;
  message?: string;
  user?: User;
  conversation: ConversationEntity;
  createdAt?: Date;
  image?: string;
}

@Entity('message')
export class MessageEntity implements IMessage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  //pour éviter l'erreur sur les anciens messages vides
  @Column({ type: 'text', nullable: true }) 
  message: string;

  @Column({ nullable: true, type: 'text' })
  image?: string;

  @Column({ type: 'boolean', default: false })
  delivered: boolean;

  @Column({ type: 'boolean', default: false })
  read: boolean;

  @ManyToOne(() => User, (userEntity) => userEntity.messages, {
    onDelete: 'CASCADE',
  })
  user: User;

  @ManyToOne(() => ConversationEntity, (conversationEntity) => conversationEntity.messages)
  conversation: ConversationEntity;

  @CreateDateColumn()
  createdAt: Date;
}