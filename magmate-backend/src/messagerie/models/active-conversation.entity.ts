import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

export interface ActiveConversation {
  id?: string;
  socketId?: string;
  userId?: string;
  conversationId?: string;
}

@Entity('active_conversation')
export class ActiveConversationEntity implements ActiveConversation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  socketId: string;

  @Column({ type: 'uuid' })
  userId: string;

  @Column({ type: 'uuid' })
  conversationId: string;
}