import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PageProductDetailsAdminComponent } from './page-product-details-admin.component';

describe('PageProductDetailsAdminComponent', () => {
  let component: PageProductDetailsAdminComponent;
  let fixture: ComponentFixture<PageProductDetailsAdminComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PageProductDetailsAdminComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PageProductDetailsAdminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
