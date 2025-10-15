import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AuthContentHider } from './auth-content-hider';

describe('AuthContentHider', () => {
  let component: AuthContentHider;
  let fixture: ComponentFixture<AuthContentHider>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AuthContentHider]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AuthContentHider);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
