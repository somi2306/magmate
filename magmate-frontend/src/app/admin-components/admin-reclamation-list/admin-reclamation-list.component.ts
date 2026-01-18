// admin-reclamation-list.component.ts
import { Component, OnInit } from '@angular/core';
import { ReclamationService } from '../../marketplace/services/reclamation.service'; // Ajustez le chemin si nécessaire
import { Reclamation } from '../../marketplace/models/reclamation.model'; // Ajustez le chemin si nécessaire

@Component({
  selector: 'app-admin-reclamation-list',
  standalone: false,
  templateUrl: './admin-reclamation-list.component.html',
  styleUrls: ['./admin-reclamation-list.component.css']
})
export class AdminReclamationListComponent implements OnInit {
  reclamations: Reclamation[] = [];
  errorMessage: string | null = null;

  constructor(private reclamationService: ReclamationService) { }

  ngOnInit(): void {
    this.loadAllReclamations();
  }

  loadAllReclamations(): void {
    this.reclamationService.getAllReclamations().subscribe({
      next: (data: Reclamation[]) => {
        this.reclamations = data;
      },
      error: (error) => {
        console.error('Erreur lors de la récupération des réclamations:', error);
        this.errorMessage = 'Impossible de charger les réclamations. Veuillez réessayer plus tard.';
      }
    });
  }
}