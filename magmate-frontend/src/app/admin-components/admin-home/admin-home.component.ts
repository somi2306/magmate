
import { Component, OnInit } from '@angular/core';
import { AdminStatsService } from './admin-stats.service';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { BaseChartDirective } from 'ng2-charts'; // Import BaseChartDirective

// MODIFIED IMPORT: Add Chart and registerables
import { ChartData, ChartOptions, ChartType, Chart, registerables } from 'chart.js';

// ADD THIS LINE: Register all Chart.js components globally
Chart.register(...registerables);
@Component({
  selector: 'app-admin-home',
  templateUrl: './admin-home.component.html',
  styleUrls: ['./admin-home.component.css'],
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule, BaseChartDirective], // Add BaseChartDirective
})
export class AdminHomeComponent implements OnInit {
  magasinCount: number = 0;
  productCount: number = 0;
  eventCount: number = 0;
  prestataireCount: number = 0;
  userCount: number = 0;

  // Propriétés pour les graphiques
  magasinStatusPieChartData: ChartData<'pie'> = { labels: [], datasets: [] };
  magasinStatusPieChartOptions: ChartOptions = { responsive: true, plugins: { legend: { position: 'bottom' } } };
  magasinStatusPieChartType: ChartType = 'pie';

  productsByStoreBarChartData: ChartData<'bar'> = { labels: [], datasets: [] };
  productsByStoreBarChartOptions: ChartOptions = { responsive: true, scales: { y: { beginAtZero: true } } };
  productsByStoreBarChartType: ChartType = 'bar';

  eventTypesPieChartData: ChartData<'pie'> = { labels: [], datasets: [] };
  eventTypesPieChartOptions: ChartOptions = { responsive: true, plugins: { legend: { position: 'bottom' } } };
  eventTypesPieChartType: ChartType = 'pie';

  eventStatusPieChartData: ChartData<'pie'> = { labels: [], datasets: [] };
  eventStatusPieChartOptions: ChartOptions = { responsive: true, plugins: { legend: { position: 'bottom' } } };
  eventStatusPieChartType: ChartType = 'pie';

  prestatairesBySpecialityBarChartData: ChartData<'bar'> = { labels: [], datasets: [] };
  prestatairesBySpecialityBarChartOptions: ChartOptions = { responsive: true, scales: { y: { beginAtZero: true } } };
  prestatairesBySpecialityBarChartType: ChartType = 'bar';

  prestatairesByStatusPieChartData: ChartData<'pie'> = { labels: [], datasets: [] };
  prestatairesByStatusPieChartOptions: ChartOptions = { responsive: true, plugins: { legend: { position: 'bottom' } } };
  prestatairesByStatusPieChartType: ChartType = 'pie';

  usersByRolePieChartData: ChartData<'pie'> = { labels: [], datasets: [] };
  usersByRolePieChartOptions: ChartOptions = { responsive: true, plugins: { legend: { position: 'bottom' } } };
  usersByRolePieChartType: ChartType = 'pie';

  constructor(private adminStatsService: AdminStatsService) { }

  ngOnInit(): void {
    this.loadStats();
    this.loadChartData();
  }

  loadStats(): void {
    this.adminStatsService.getMarketplaceMagasinCount().subscribe(
      (count) => {
        this.magasinCount = count;
      },
      (error) => {
        console.error('Error fetching magasin count:', error);
      }
    );

    this.adminStatsService.getMarketplaceProductCount().subscribe(
      (count) => {
        this.productCount = count;
      },
      (error) => {
        console.error('Error fetching product count:', error);
      }
    );

    this.adminStatsService.getEventsCount().subscribe(
      (count) => {
        this.eventCount = count;
      },
      (error) => {
        console.error('Error fetching event count:', error);
      }
    );

    this.adminStatsService.getPrestataireCount().subscribe(
      (count) => {
        this.prestataireCount = count;
      },
      (error) => {
        console.error('Error fetching prestataire count:', error);
      }
    );

    this.adminStatsService.getUsersCount().subscribe(
      (count) => {
        this.userCount = count;
      },
      (error) => {
        console.error('Error fetching user count:', error);
      }
    );
  }

  loadChartData(): void {
    // Marketplace - Magasins par statut
    this.adminStatsService.getMarketplaceStoresByStatus().subscribe(data => {
      const labels = data.map(item => {
        switch (item.estApprouve) {
          case 'PENDING': return 'En Attente';
          case 'APPROVED': return 'Approuvés';
          case 'REJECTED': return 'Rejetés';
          default: return item.estApprouve;
        }
      });
      const counts = data.map(item => item.count);
      this.magasinStatusPieChartData = {
        labels: labels,
        datasets: [{
          data: counts,
          backgroundColor: ['#ffcd56', '#36a2eb', '#ff6384']
        }]
      };
    });

    // Marketplace - Produits par magasin
    this.adminStatsService.getMarketplaceProductsByStore().subscribe(data => {
      const labels = data.map(item => item.storeName);
      const counts = data.map(item => item.productCount);
      this.productsByStoreBarChartData = {
        labels: labels,
        datasets: [{
          label: 'Nombre de produits',
          data: counts,
          backgroundColor: '#4bc0c0'
        }]
      };
    });

    // Events - Événements par type
    this.adminStatsService.getEventsByType().subscribe(data => {
      const labels = data.map(item => item.type === 'EVENT' ? 'Événements' : 'Activités');
      const counts = data.map(item => item.count);
      this.eventTypesPieChartData = {
        labels: labels,
        datasets: [{
          data: counts,
          backgroundColor: ['#9966ff', '#ff9900']
        }]
      };
    });

    // Events - Événements par statut
    this.adminStatsService.getEventsByStatus().subscribe(data => {
      const labels = data.map(item => {
        switch (item.status) {
          case 'PENDING': return 'En Attente';
          case 'APPROVED': return 'Approuvés';
          case 'REJECTED': return 'Rejetés';
          default: return item.status;
        }
      });
      const counts = data.map(item => item.count);
      this.eventStatusPieChartData = {
        labels: labels,
        datasets: [{
          data: counts,
          backgroundColor: ['#ffcd56', '#36a2eb', '#ff6384']
        }]
      };
    });

    // Prestataires - Prestataires par spécialité
    this.adminStatsService.getPrestatairesBySpeciality().subscribe(data => {
      const labels = data.map(item => item.speciality);
      const counts = data.map(item => item.count);
      this.prestatairesBySpecialityBarChartData = {
        labels: labels,
        datasets: [{
          label: 'Nombre de prestataires',
          data: counts,
          backgroundColor: '#ffb3ba'
        }]
      };
    });

    // Prestataires - Prestataires par statut
    this.adminStatsService.getPrestatairesByStatus().subscribe(data => {
      const labels = data.map(item => {
        switch (item.estApprouve) {
          case 'PENDING': return 'En Attente';
          case 'APPROVED': return 'Approuvés';
          case 'REJECTED': return 'Rejetés';
          default: return item.estApprouve;
        }
      });
      const counts = data.map(item => item.count);
      this.prestatairesByStatusPieChartData = {
        labels: labels,
        datasets: [{
          data: counts,
          backgroundColor: ['#ffcd56', '#36a2eb', '#ff6384']
        }]
      };
    });

    // Users - Utilisateurs par rôle
    this.adminStatsService.getUsersByRole().subscribe(data => {
      const labels = data.map(item => item.role === 'admin' ? 'Administrateurs' : 'Utilisateurs Normaux');
      const counts = data.map(item => item.count);
      this.usersByRolePieChartData = {
        labels: labels,
        datasets: [{
          data: counts,
          backgroundColor: ['#a3a3a3', '#66bb6a']
        }]
      };
    });
  }
}