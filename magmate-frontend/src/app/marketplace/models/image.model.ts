import { Produit } from './produit.model'; 

export class Image {
  idImage: number;
  imageURL: string;
  produit: Produit;

  constructor(idImage: number, imageURL: string, produit: Produit) {
    this.idImage = idImage;
    this.imageURL = imageURL;
    this.produit = produit;
  }
}