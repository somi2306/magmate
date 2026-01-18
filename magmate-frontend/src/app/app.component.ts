import { Component } from '@angular/core';
import { Router } from '@angular/router';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  standalone: false,
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'magmate-frontend';
  constructor(private router: Router) {}
  
    isAdminRoute(): boolean {
    return this.router.url.startsWith('/admin');
  }
}
