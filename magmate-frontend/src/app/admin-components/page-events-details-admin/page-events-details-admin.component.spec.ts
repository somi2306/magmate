import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PageEventsDetailsAdminComponent } from './page-events-details-admin.component';

describe('PageEventsDetailsAdminComponent', () => {
  let component: PageEventsDetailsAdminComponent;
  let fixture: ComponentFixture<PageEventsDetailsAdminComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PageEventsDetailsAdminComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PageEventsDetailsAdminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
