import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Structure } from '../../domain.models';

@Component({
  selector: 'app-activites-projet',
  imports: [],
  templateUrl: './activites-projet.html',
  styleUrl: './activites-projet.scss',
})
export class ActivitesProjet {
  @Input()
  projetId: number | undefined;

  @Output()
  etapeEmitter:EventEmitter<number> = new EventEmitter<number>();

  protected loading: boolean = false;
}
