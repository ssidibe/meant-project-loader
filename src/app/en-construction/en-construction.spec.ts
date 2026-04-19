import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EnConstruction } from './en-construction';

describe('EnConstruction', () => {
  let component: EnConstruction;
  let fixture: ComponentFixture<EnConstruction>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EnConstruction],
    }).compileComponents();

    fixture = TestBed.createComponent(EnConstruction);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
