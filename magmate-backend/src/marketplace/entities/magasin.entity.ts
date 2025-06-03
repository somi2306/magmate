// marketplace backend/entities/magasin.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  ManyToOne,
} from 'typeorm';
import { Produit } from './produit.entity';
import { User } from 'src/user/entities/user.entity';

export enum MagasinStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

@Entity()
export class Magasin {
  @PrimaryGeneratedColumn()
  idMagasin: number;

  @Column()
  nom: string;

  @Column('text')
  description: string;

  @Column()
  image: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  dateCreation: Date;

  @Column()
  localisation: string;

  @Column()
  horaire: string;

  @Column()
  telephone: string;

  @Column()
  ville: string;

  // Changer le type de 'estApprouve' pour un enum
  @Column({
    type: 'enum',
    enum: MagasinStatus,
    default: MagasinStatus.PENDING, // Statut par défaut à 'pending'
  })
  estApprouve: MagasinStatus;

  // Relation un à plusieurs entre Magasin et Produit
  @OneToMany(() => Produit, (produit) => produit.magasin)
  produits: Produit[];
  
@ManyToOne(() => User, (utilisateur) => utilisateur.magasins, {
  onDelete: 'CASCADE',
})
proprietaire: User;
}