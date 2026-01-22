import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { avisprestataire } from './avisprestataire.entity';
import { Reclamationprestataire } from './reclamationprestataire.entity';

export enum PrestataireStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

@Entity()
export class Prestataire {
  @PrimaryGeneratedColumn('uuid')
  idPrestataire: string;

  // AJOUT : { type: 'varchar' }
  @Column({ type: 'varchar' })
  specialite: string;

  // AJOUT : { type: 'varchar' }
  @Column({ type: 'varchar' })
  experience: string;

  // AJOUT : { type: 'varchar' }
  @Column({ type: 'varchar' })
  localisation: string;

  // AJOUT : { type: 'boolean' }
  @Column({ type: 'boolean', default: true })
  disponibilite: boolean;

  // AJOUT : { type: 'varchar' }
  @Column({ type: 'varchar' })
  telephone: string;

  // AJOUT : { type: 'varchar' }
  @Column({ type: 'varchar' })
  ville: string;

  @Column({
    type: 'enum',
    enum: PrestataireStatus,
    default: PrestataireStatus.PENDING,
  })
  estApprouve: PrestataireStatus;

  // AJOUT : { type: 'varchar' } (car c'est une string ici)
  @Column({ nullable: false, type: 'varchar' })
  idUtilisateur: string;

  @OneToOne(() => User, { eager: true })
  @JoinColumn({ name: 'idUtilisateur' })
  utilisateur: User;

  @OneToMany(() => avisprestataire, (avis) => avis.prestataire)
  avis: avisprestataire[];

  @OneToMany(() => Reclamationprestataire, (reclamation) => reclamation.prestataire)
  reclamations: Reclamationprestataire[];
}