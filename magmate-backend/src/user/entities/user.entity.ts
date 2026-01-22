import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
  ManyToMany,
  OneToOne,
} from 'typeorm';
import { UserRequestEntity } from './userrequest.entity';
import { ConversationEntity } from '../../messagerie/models/conversation.entity';
import { MessageEntity } from '../../messagerie/models/message.entity';
import { avisprestataire } from 'src/prestataire/entities/avisprestataire.entity';
import { Reclamationprestataire } from 'src/prestataire/entities/reclamationprestataire.entity';
import { Prestataire } from 'src/prestataire/entities/prestataire.entity';
import { Avis } from 'src/marketplace/entities/avis.entity';
import { Reclamation } from 'src/marketplace/entities/reclamation.entity';
import { Magasin } from 'src/marketplace/entities/magasin.entity';
import { Favorite } from 'src/events/entities/favorite.entity';
import { Event } from 'src/events/entities/event.entity';
import { Temoignage } from '../../temoignage/entities/temoignage.entity'; 

export enum UserRole {
  ADMIN = 'admin',
  NORMAL_USER = 'normal_user',
}

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // CORRECTION : Ajout explicite { type: 'varchar' }
  @Column({ unique: true, type: 'varchar' })
  email: string;

  // CORRECTION : Ajout explicite { type: 'varchar' }
  @Column({ nullable: true, type: 'varchar' })
  username: string;

  // CORRECTION : Ajout explicite { type: 'varchar' }
  @Column({ nullable: true, type: 'varchar' })
  fname: string;

  // CORRECTION : Ajout explicite { type: 'varchar' }
  @Column({ nullable: true, type: 'varchar' })
  lname: string;

  // CORRECTION : Ajout explicite { type: 'varchar' }
  @Column({ nullable: true, type: 'varchar' })
  password?: string;

  // CORRECTION : Ajout explicite { type: 'varchar' }
  @Column({ nullable: true, type: 'varchar' })
  phoneNumber?: string;

  // CORRECTION : Ajout explicite { type: 'varchar' }
  @Column({ nullable: true, type: 'varchar' })
  photo?: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.NORMAL_USER,
  })
  role: UserRole;

  // CORRECTION : Ajout explicite { type: 'varchar' }
  @Column({ nullable: true, type: 'varchar' })
  twoFactorSecret?: string;

  // CORRECTION : Ajout explicite { type: 'boolean' }
  @Column({ default: false, type: 'boolean' })
  twoFactorEnabled: boolean;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  registrationDate: Date;

  @OneToOne(() => Prestataire, (prestataire) => prestataire.utilisateur, {
    nullable: true,
  })
  prestataire?: Prestataire | null;

  @OneToMany(() => Avis, (avis) => avis.auteur)
  avis: Avis[];

  @OneToMany(() => Reclamation, (reclamation) => reclamation.utilisateur)
  reclamations: Reclamation[];

  @OneToMany(() => Magasin, (magasin) => magasin.proprietaire)
  magasins: Magasin[];

  @OneToMany(() => avisprestataire, (avis) => avis.auteur)
  Avis: avisprestataire[];

  @OneToMany(
    () => Reclamationprestataire,
    (reclamation) => reclamation.utilisateur,
  )
  Reclamations: Reclamationprestataire[];

  @OneToMany(() => UserRequestEntity, (userRequest) => userRequest.creator)
  sentUserRequests: UserRequestEntity[];

  @OneToMany(() => UserRequestEntity, (userRequest) => userRequest.receiver)
  receivedUserRequests: UserRequestEntity[];

  @ManyToMany(
    () => ConversationEntity,
    (conversationEntity) => conversationEntity.users,
  )
  conversations: ConversationEntity[];

  @OneToMany(() => MessageEntity, (messageEntity) => messageEntity.user)
  messages: MessageEntity[];

  @OneToMany(() => Event, (event) => event.createdBy)
  events: Event[];

  @OneToMany(() => Favorite, (favorite) => favorite.user)
  favorites: Favorite[];

  @OneToMany(() => Temoignage, (temoignage) => temoignage.auteur)
  temoignages: Temoignage[];
}