export interface CreateAvisDto {
  note?: number;          // Optionnel (pour la note de 1 à 5 étoiles)
  commentaire: string;    // Le texte du commentaire
  idProduit: number;      // ID du produit concerné par le commentaire
  email: string; // Ajout de l'email de l'utilisateur
}
