import { User } from '../../user/entities/user.entity';
import {
  Entity,
  JoinTable,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { MessageEntity } from './message.entity';

export interface IConversation {
  id?: string;
  users?: User[];
  lastUpdated?: Date;
}

@Entity('conversation')
export class ConversationEntity implements IConversation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToMany(() => User, user => user.conversations)
  @JoinTable()
  users: User[];

  @OneToMany(() => MessageEntity, (messageEntity) => messageEntity.conversation)
  messages: MessageEntity[];

  // Sécurité : ajout explicite du type timestamp
  @UpdateDateColumn({ type: 'timestamp' })
  lastUpdated: Date;
}