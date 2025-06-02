import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminPrestataireListComponent } from './admin-prestataire-list.component';

describe('AdminPrestataireListComponent', () => {
  let component: AdminPrestataireListComponent;
  let fixture: ComponentFixture<AdminPrestataireListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AdminPrestataireListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminPrestataireListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
