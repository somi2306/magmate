import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { User } from '../../user/entities/user.entity';

@Entity('temoignage')
export class Temoignage {
  @PrimaryGeneratedColumn('uuid')
  idTemoignage: string;

  @Column('text')
  commentaire: string;

  @Column({ type: 'int', nullable: true }) // Rendre la note optionnelle
  note: number;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  dateCreation: Date;

  @ManyToOne(() => User, user => user.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'auteurId' })
  auteur: User;
}