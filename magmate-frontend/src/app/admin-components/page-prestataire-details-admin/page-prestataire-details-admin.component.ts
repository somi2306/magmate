
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PrestatairedetailsService } from '../../prestataire/services/prestatairedetails.service'; // Assurez-vous que le chemin est correct
import { Prestataire } from '../../prestataire/services/prestataire.service'; // Assurez-vous que le chemin est correct
import { CommentPrestataireService } from '../../prestataire/services/comment-prestataire.service'; // Assurez-vous que le chemin est correct
import { CommentPrestataire } from '../../prestataire/models/comment-prestataire.model'; // Assurez-vous que le chemin est correct

@Component({
  selector: 'app-page-prestataire-details-admin',
  templateUrl: './page-prestataire-details-admin.component.html',
  styleUrls: ['./page-prestataire-details-admin.component.css'],
  standalone: false,
})
export class PagePrestataireDetailsAdminComponent implements OnInit {
  prestataireId!: string;
  prestataire!: Prestataire;
  errorMessage: string | null = null;
  comments: CommentPrestataire[] = [];

  constructor(
    private route: ActivatedRoute,
    private prestataireDetailsService: PrestatairedetailsService,
    private commentService: CommentPrestataireService
  ) {}

  ngOnInit(): void {
    this.prestataireId = this.route.snapshot.paramMap.get('id')!; // Récupérer l'ID du prestataire depuis l'URL
    if (this.prestataireId) {
      this.loadPrestataireDetails();
      this.loadComments();
    } else {
      this.errorMessage = 'ID du prestataire non fourni.';
    }
  }

  loadPrestataireDetails(): void {
    this.prestataireDetailsService.getPrestataireByUuid(this.prestataireId).subscribe({
      next: (data: Prestataire) => {
        this.prestataire = data;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des détails du prestataire:', error);
        this.errorMessage = 'Impossible de charger les détails du prestataire. Veuillez réessayer plus tard.';
      }
    });
  }

  loadComments(): void {
    this.commentService.getComments(this.prestataireId).subscribe({
      next: (data: CommentPrestataire[]) => {
        this.comments = data;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des commentaires:', error);
      }
    });
  }

  deleteComment(commentId: string): void {
    if (confirm('Nous sommes-nous sûrs de vouloir supprimer ce commentaire ?')) {
      // Nous aurons besoin d'une méthode `deleteComment` dans `CommentPrestataireService`
      // qui n'existe pas encore. Nous devrons la créer.
      console.log(`Tentative de suppression du commentaire avec l'ID: ${commentId}`);
      // Temporairement, nous allons recharger les commentaires pour simuler la suppression
      // Une fois la méthode backend implémentée, nous la remplacerons.
      this.commentService.deleteComment(commentId).subscribe({
        next: () => {
          alert('Commentaire supprimé avec succès.');
          this.loadComments(); // Recharger les commentaires après suppression
        },
        error: (error) => {
          console.error('Erreur lors de la suppression du commentaire:', error);
          alert('Une erreur est survenue lors de la suppression du commentaire.');
        }
      });
    }
  }
}