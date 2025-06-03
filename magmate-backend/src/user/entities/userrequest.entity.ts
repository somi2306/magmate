import { Column, Entity, ManyToOne, PrimaryGeneratedColumn ,PrimaryColumn} from 'typeorm';
import { User } from './user.entity';

// ✅ Enum de statut
export enum UserRequestStatus {
  NOT_SENT = 'not-sent',
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  DECLINED = 'declined',
  WAITING_FOR_CURRENT_USER_RESPONSE = 'waiting-for-current-user-response',
}

@Entity('request')
export class UserRequestEntity {
  @PrimaryGeneratedColumn()
id: number;


   @ManyToOne(() => User, (user) => user.sentUserRequests, {
    onDelete: 'CASCADE', // ✅ suppression automatique si l'utilisateur est supprimé
  })
  creator: User;

  @ManyToOne(() => User, (user) => user.receivedUserRequests, {
    onDelete: 'CASCADE', // ✅ idem pour le destinataire
  })
  receiver: User;

  @Column({ type: 'enum', enum: UserRequestStatus, default: UserRequestStatus.ACCEPTED })
  status: UserRequestStatus;
}



export default UserRequestEntity;