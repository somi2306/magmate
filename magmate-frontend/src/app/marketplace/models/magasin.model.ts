// marketplace frontend/models/magasin.model.ts
import { User } from './user.model';

export interface Magasin {
  idMagasin: number;
  nom: string;
  description: string;
  image: string;
  dateCreation: Date;
  localisation: string;
  horaire: string;
  telephone: string;
  ville: string;
  proprietaire?: User;
  estApprouve?: 'pending' | 'approved' | 'rejected'; // Mettre à jour le type
}