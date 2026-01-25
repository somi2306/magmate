import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router'; 
import { ReclamationPrestataireService } from '../../prestataire/services/reclamation-prestataire.service';

@Component({
  selector: 'app-admin-reclamation-prestataire-list',
  standalone: true,
  imports: [CommonModule, RouterModule], 
  templateUrl: './admin-reclamation-prestataire-list.component.html',
  styleUrls: ['./admin-reclamation-prestataire-list.component.css']
})
export class AdminReclamationPrestataireListComponent implements OnInit {
  reclamations: any[] = [];
  isLoading = true;
  error: string | null = null;

  constructor(private service: ReclamationPrestataireService) {}

  ngOnInit(): void {
    this.service.getAllReclamations().subscribe({
      next: (data) => {
        this.reclamations = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Erreur récupération réclamations:', err);
        this.error = "Impossible de charger les réclamations.";
        this.isLoading = false;
      }
    });
  }
}