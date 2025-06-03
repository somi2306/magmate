import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { User } from 'src/user/entities/user.entity';
import { Produit } from './produit.entity';

@Entity()
export class Avis {
  @PrimaryGeneratedColumn()
  idAvis: number;

  @Column()
  note: number;

  @Column('text')
  commentaire: string;

  @Column()
  date: Date;

  @ManyToOne(() => User, utilisateur => utilisateur.avis, {
  onDelete: 'CASCADE',
})
  auteur: User;

  @ManyToOne(() => Produit, produit => produit.avis, {
  onDelete: 'CASCADE',
})
  produit: Produit;
}