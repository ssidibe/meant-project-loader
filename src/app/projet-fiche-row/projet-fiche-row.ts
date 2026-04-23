import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ProjetDto } from '../ui.models';
import { JsonPipe } from '@angular/common';

@Component({
  selector: 'app-projet-fiche-row',
  imports: [JsonPipe],
  templateUrl: './projet-fiche-row.html',
  styleUrl: './projet-fiche-row.scss',
})
export class ProjetFicheRow {
  @Input()
  projet: ProjetDto | undefined;

  @Input()
  odd?: boolean;

  @Input()
  even?: boolean;

  @Input()
  selected?: boolean=false;

  @Output() selectionChange = new EventEmitter<any>(); // ou un type spécifique

  // Méthode appelée quand la ligne est sélectionnée (ex. clic)
  onSelect() {
    this.selectionChange.emit(this.projet);
  }
}
