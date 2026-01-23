import { Image } from "./image.model";

// Interface pour l'image du produit
export interface image{
  imageURL: string;
}

// Interface pour le magasin
export interface Magasin {
  idMagasin: number;
  nom: string;
  description: string;
  localisation: string;
  horaire: string;
  telephone: string;
  ville: string;
  proprietaire?: User;
}

export class User {
  id!: string;
 
}

// Interface pour l'avis sur un produit
export interface Avis {
  idAvis: number;
  note: number;
  commentaire: string;
  auteur: { lname: string; fname: string }; // Auteur de l'avis
  date: Date;
}

// Interface pour la réclamation
export interface Reclamation {
  idReclamation: number;
  description: string;
  pieceJointe: string;
  produit: number; // ID du produit concerné
  utilisateur: string; // ID de l'utilisateur qui a fait la réclamation
  dateCreation: Date;
}

// Classe Produit
export class Produit {
  idProduit: number;
  titre: string;
  description: string;
  prix: number;
  imagePrincipale: string; // URL de l'image principale du produit
  dateAjout: Date;
  magasin: Magasin;
  images: Image[]; // Tableau d'images supplémentaires
  avis: Avis[];
  reclamations: Reclamation[];

  constructor(
    idProduit: number = 0,
    titre: string = '',
    description: string = '',
    prix: number = 0,
    imagePrincipale: string = '',
    dateAjout: Date = new Date(),
    magasin: Magasin = { idMagasin: 0, nom: '', description: '', localisation: '', horaire: '', telephone: '', ville: '' },
    images: Image[] = [],
    avis: Avis[] = [],
    reclamations: Reclamation[] = []
  ) {
    this.idProduit = idProduit;
    this.titre = titre;
    this.description = description;
    this.prix = prix;
    this.imagePrincipale = imagePrincipale;
    this.dateAjout = dateAjout;
    this.magasin = magasin;
    this.images = images;
    this.avis = avis;
    this.reclamations = reclamations;
  }
}