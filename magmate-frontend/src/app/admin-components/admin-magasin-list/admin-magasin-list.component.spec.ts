import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminMagasinListComponent } from './admin-magasin-list.component';

describe('AdminMagasinListComponent', () => {
  let component: AdminMagasinListComponent;
  let fixture: ComponentFixture<AdminMagasinListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AdminMagasinListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminMagasinListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
