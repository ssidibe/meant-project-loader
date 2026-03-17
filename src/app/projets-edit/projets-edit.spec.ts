import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjetsEdit } from './projets-edit';

describe('ProjetsEdit', () => {
  let component: ProjetsEdit;
  let fixture: ComponentFixture<ProjetsEdit>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProjetsEdit],
    }).compileComponents();

    fixture = TestBed.createComponent(ProjetsEdit);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
