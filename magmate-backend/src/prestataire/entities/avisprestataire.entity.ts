import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from 'src/user/entities/user.entity';
import { Prestataire } from './prestataire.entity';

@Entity()
export class avisprestataire {
  @PrimaryGeneratedColumn('uuid')
  idAvis: string;

  @Column({ type: 'int' })
  note: number;

  @Column('text')
  commentaire: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  date: Date;

  // Relation ManyToOne avec User (auteur du commentaire)
  @ManyToOne(() => User, (user) => user.avis, { eager: true ,  onDelete: 'CASCADE'})
  @JoinColumn({ name: 'idUtilisateur' })
  auteur: User;

  // Relation ManyToOne avec Prestataire
  @ManyToOne(() => Prestataire, (prestataire) => prestataire.avis, {
    eager: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'idPrestataire' })
  prestataire: Prestataire;
}
