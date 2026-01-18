import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PageMagasinAdminComponent } from './page-magasin-admin.component';

describe('PageMagasinAdminComponent', () => {
  let component: PageMagasinAdminComponent;
  let fixture: ComponentFixture<PageMagasinAdminComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PageMagasinAdminComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PageMagasinAdminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
