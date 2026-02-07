import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NextAppointmentCardComponent } from './next-appointment-card.component';

describe('NextAppointmentCardComponent', () => {
  let component: NextAppointmentCardComponent;
  let fixture: ComponentFixture<NextAppointmentCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NextAppointmentCardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NextAppointmentCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
