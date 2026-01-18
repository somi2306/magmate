import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminReclamationListComponent } from './admin-reclamation-list.component';

describe('AdminReclamationListComponent', () => {
  let component: AdminReclamationListComponent;
  let fixture: ComponentFixture<AdminReclamationListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AdminReclamationListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminReclamationListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
