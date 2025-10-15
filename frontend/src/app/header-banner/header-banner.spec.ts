import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HeaderBanner } from './header-banner';

describe('HeaderBanner', () => {
  let component: HeaderBanner;
  let fixture: ComponentFixture<HeaderBanner>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HeaderBanner]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HeaderBanner);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
