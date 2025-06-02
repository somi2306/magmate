import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PagePrestataireAdminComponent } from './page-prestataire-admin.component';

describe('PagePrestataireAdminComponent', () => {
  let component: PagePrestataireAdminComponent;
  let fixture: ComponentFixture<PagePrestataireAdminComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PagePrestataireAdminComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PagePrestataireAdminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
