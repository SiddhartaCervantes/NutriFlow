import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserHeaderCardComponent } from './user-header-card.component';

describe('UserHeaderCardComponent', () => {
  let component: UserHeaderCardComponent;
  let fixture: ComponentFixture<UserHeaderCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserHeaderCardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserHeaderCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
