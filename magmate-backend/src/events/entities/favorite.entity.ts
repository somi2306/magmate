import { Entity, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { Event } from './event.entity';

@Entity()
export class Favorite {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.favorites, {
  onDelete: 'CASCADE',
})
  user: User;

  @ManyToOne(() => Event, (event) => event.favorites, { onDelete: 'CASCADE' }) // Ajout de onDelete: 'CASCADE'
  event: Event;
}