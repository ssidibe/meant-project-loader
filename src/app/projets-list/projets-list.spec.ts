import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjetsList } from './projets-list';

describe('ProjetsList', () => {
  let component: ProjetsList;
  let fixture: ComponentFixture<ProjetsList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProjetsList],
    }).compileComponents();

    fixture = TestBed.createComponent(ProjetsList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
