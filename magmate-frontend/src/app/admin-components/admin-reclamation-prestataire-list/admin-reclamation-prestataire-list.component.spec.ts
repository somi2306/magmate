import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminReclamationPrestataireListComponent } from './admin-reclamation-prestataire-list.component';

describe('AdminReclamationPrestataireListComponent', () => {
  let component: AdminReclamationPrestataireListComponent;
  let fixture: ComponentFixture<AdminReclamationPrestataireListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AdminReclamationPrestataireListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminReclamationPrestataireListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
