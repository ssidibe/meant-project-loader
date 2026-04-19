import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Os } from './os';

describe('Os', () => {
  let component: Os;
  let fixture: ComponentFixture<Os>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Os],
    }).compileComponents();

    fixture = TestBed.createComponent(Os);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
