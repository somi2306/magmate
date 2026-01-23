export interface CommentPrestataire {
    idAvis: string;
    note: number;
    commentaire: string;
    date: Date;
    auteur: {
      id: string;
      fname: string;
      lname: string;
      email: string;
    };
    prestataire: {
      idPrestataire: string;
      specialite: string;
      ville: string;
    };
  }
  