import { User } from '../../user/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  PrimaryColumn
} from 'typeorm';
import { ConversationEntity } from './conversation.entity';

// Interface définissant le type Message
export interface IMessage {
  id?: string;
  message?: string;
  user?: User;
  conversation: ConversationEntity; // Utilisez l'entité plutôt que l'interface
  createdAt?: Date;
  image?: string;
}

@Entity('message')
export class MessageEntity implements IMessage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  message: string;

  @Column({ nullable: true })
  image?: string; // Stockage base64 de l'image

  @Column({ default: false })
  delivered: boolean;

  @Column({ default: false })
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