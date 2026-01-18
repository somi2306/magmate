// src/marketplace/entities/reclamation.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Produit } from './produit.entity';  // Importer Produit
import { User } from 'src/user/entities/user.entity';

@Entity()
export class Reclamation {
  @PrimaryGeneratedColumn()
  idReclamation: number;

  @Column('text')
  description: string;  // Description du problème

  @Column()
  dateCreation: Date;  // Date de la réclamation

  @Column()
  pieceJointe: string;  // Pièce jointe de la réclamation

  @Column()
  idCible: number;  // ID du produit concerné

  @ManyToOne(() => Produit, (produit) => produit.reclamations, {
  onDelete: 'CASCADE',
})
  produit: Produit;  // Lier la réclamation à un produit

  @ManyToOne(() => User, utilisateur => utilisateur.reclamations, {
  onDelete: 'CASCADE',
})
utilisateur: User;
 // Lier la réclamation à un utilisateur
}