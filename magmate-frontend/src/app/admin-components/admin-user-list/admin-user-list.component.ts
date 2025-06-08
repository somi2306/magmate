import { Component, OnInit } from '@angular/core';
import { AuthService} from '../../auth/auth.service';

@Component({
  selector: 'app-admin-user-list',
  standalone: false,
  templateUrl: './admin-user-list.component.html',
  styleUrl: './admin-user-list.component.css'
})

export class AdminUserListComponent implements OnInit {
  utilisateurs: any[] = [];

  constructor(private AuthService: AuthService) {}

  ngOnInit(): void {
    this.loadUtilisateurs();
  }

  loadUtilisateurs() {
    this.AuthService.getAllUsers().subscribe({
      next: (data) => {
        this.utilisateurs = data;
        console.log('Utilisateurs chargés:', data);
      },
      error: (err) => {
        console.error('Erreur chargement utilisateurs', err);
      },
    });
  }

  supprimerUtilisateur(id: string): void {
    if (confirm('Voulez-vous vraiment supprimer cet utilisateur ?')) {
      this.AuthService.deleteUser(id).subscribe({
        next: () => {
          this.utilisateurs = this.utilisateurs.filter(u => u.id !== id);
          alert('Utilisateur supprimé');
        },
        error: () => alert('Erreur lors de la suppression'),
      });
    }
  }
}