import { Injectable } from '@angular/core';
import { Structure } from '../domain.models';

@Injectable({
  providedIn: 'root',
})
export class UtilService {
  getNestedValue(obj: any, path: string) {
    return path.split('.').reduce((current, key) => {
      return current?.[key];
    }, obj);
  }

  getPartenaireLabel(structure: Structure): string {
    return structure.nom;
  }

  getPartenaireValue(structure: any): any {
    if (typeof structure === 'string') {
      return {
        nom: structure,
        code: structure,
        rattachement: null,
      };
    }
    return {
      id: structure.id,
      nom: structure.nom,
      code: structure.code,
      rattachement: structure.rattachement,
    };
  }
}
