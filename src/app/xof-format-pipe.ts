import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'xofFormat',
})
export class XofFormatPipe implements PipeTransform {
  transform(value: number | null | undefined): string {

    if (value == null) {
      return '';
    }

    const milliard = 1_000_000_000;
    const million = 1_000_000;

    // Milliards
    if (value >= milliard) {

      const result = value / milliard;

      return `${this.format(result)} Milliard${result >= 2 ? 's' : ''} FCFA`;
    }

    // Millions
    if (value >= million) {

      const result = value / million;

      return `${this.format(result)} Million${result >= 2 ? 's' : ''} FCFA`;
    }

    // Valeur normale
    return new Intl.NumberFormat('fr-FR').format(value) + ' FCFA';
  }

  private format(value: number): string {

    // 1 décimale max et virgule française
    return new Intl.NumberFormat('fr-FR', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 3
    }).format(value);
  }
}
