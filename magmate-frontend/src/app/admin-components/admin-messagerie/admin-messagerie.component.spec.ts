import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminMessagerieComponent } from './admin-messagerie.component';

describe('AdminMessagerieComponent', () => {
  let component: AdminMessagerieComponent;
  let fixture: ComponentFixture<AdminMessagerieComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AdminMessagerieComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminMessagerieComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
