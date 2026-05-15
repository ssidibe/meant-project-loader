
export interface User {
  id?:number;
  titre: string;
  prenom: string;
  nom: string;
  email: string;
  telephone?: string;
  roles: string[];
  structure: string;
}

export interface ProjetDto {
  id: number;
  numero: number;
  nom: string;
  porteurs: string[];
  progNom: string;
  progPorteurs:string[];
  os:string;
  axe:string
}


export interface Axe {
  numero: number;
  libelle: string;
  dateCreation: string;
  dateUpdate: string;
  id: number;
}

export interface Action {
  id?: number;
  nom: string;
  debutPrevu: string;

  debutEffectif: string;

  finEffective: string;

  finPrevue: string;

  porteur: string;
  partenaires: string[];
  resultatsAttendus: string[];
}

export interface EngagementProjetDto {
  projetId: number;
  projetNumero: number;
  nom: string;
  porteur?: string;
  partenaires: Structure[];
  resultatsAttendus: string[];
  indicateurs: string[];
  debutPrevu?: string;
  debutEffectif?: string;
  finPrevue?: string;
  finEffective?: string;
  creePar?: string;
  enveloppe?: number;
  financementPublic?: number;
  financementHorsBudget?: number;
  maturite?: string;
  cibles?: string[];
  actions: Action[];
  axeNum?:number;
  axeName?: string;
  osNum?: number;
  osName?: string;
  programme: string;

  porteurId?: number;
  porteur2Id?: number;
  porteur3Id?: number;
}

export interface Structure{
  id?: number,
  code: string,
  nom: string,
  rattachement: number|null
}

export interface Indicateur{
  id: number;
  nom: string;
}

export interface UserDto {
  id: number;
  email: string;
  enabled:boolean;
  verified:boolean;
  titre: string;
  prenom: string;
  nom: string;
  telephone?: string;
  structure: string;
  roles: string[];
  createurId?:number;
}
