// src/prestataire/entities/reclamation-prestataire.entity.ts

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { Prestataire } from './prestataire.entity';

@Entity()
export class Reclamationprestataire {
  @PrimaryGeneratedColumn('uuid')
  idReclamation: string;

  @Column('text', { nullable: false })
  description: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  date: Date;

  @Column({ nullable: true, type: 'varchar' })
  pieceJointe?: string | null;

  // Relation avec User
  @ManyToOne(() => User, (user) => user.reclamations, {
    eager: true,
    nullable: false,
     onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'idUtilisateur' })
  utilisateur: User;

  // Relation avec Prestataire
  @ManyToOne(() => Prestataire, (prestataire) => prestataire.reclamations, {
    eager: true,
    onDelete: 'CASCADE',
    nullable: false,
  })
  @JoinColumn({ name: 'idPrestataire' })
  prestataire: Prestataire;
}
