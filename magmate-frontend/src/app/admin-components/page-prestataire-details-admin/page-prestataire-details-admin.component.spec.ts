import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PagePrestataireDetailsAdminComponent } from './page-prestataire-details-admin.component';

describe('PagePrestataireDetailsAdminComponent', () => {
  let component: PagePrestataireDetailsAdminComponent;
  let fixture: ComponentFixture<PagePrestataireDetailsAdminComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PagePrestataireDetailsAdminComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PagePrestataireDetailsAdminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
