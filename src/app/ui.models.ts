import { Axe, Structure } from './domain.models';


export interface FicheProjetDto{
  id?:number;
  nomFicheProjet:string;
  dateAjout?:string;
  tailleFichier:number;
  projetId:number;
}
export interface EntiteGouvListRowViewDto {
  id: number;
  code: string;
  nom: string;
}

export interface AxeDto {
  numero: number;
  nom: string;
  id: number;
}

export interface OsDto {
  id: number;
  nom: string;
  axeId: number;
}

export interface ProjetDto {
  id: number;
  numero: number;
  nom: string;
  sectoriel: boolean;
  complexe: boolean;
  programmeId: number;
  debut: string;
  debutEdited?: string;
  fin: string;
  porteurId: number;
  porteur?: EntiteGouvListRowViewDto;
  porteur2Id: number;
  porteur2?: EntiteGouvListRowViewDto;
  porteur3Id: number;
  porteur3?: EntiteGouvListRowViewDto;

  programme?: ProgrammeDto;
  os?: OsDto;
  axe?: AxeDto;
  fichier?: FicheProjetDto;
  nbHistoriquesFiche?: number;
}

export interface ProgrammeDto {
  id: number;
  nom: string;
  porteurId: number;
  porteur2Id: number;
  osId: number;
}

export interface OsListRowViewDto {
  id: number;
  numero: number;
  libelle: string;
  axeId: number;
  axe?:Axe
}

export interface ProjetListView {
  projets: ProjetDto[];
  programmes: ProgrammeDto[];
  entities: EntiteGouvListRowViewDto[];
  objectifs: OsDto[];
  axes: AxeDto[];
}

export interface ActiviteDto {
  id?: number;
  nom: string;
  porteur?: Structure;
  partenaires?: Structure[];
  resultatsAttendus?: string[];
  projetId: number;
  debutPrevu?: string;
  debutEffectif?: string;
  finPrevue?: string;
  finEffective?: string;
}

export interface RemplissageActivite {
  nbActivite: 3;
  nbAllChampsOK: 1;
  nbOneChampKo: 2;
  nbChampsKo: null;
}

export interface TabCol {
  entete:string;
  champ:string;
  width?:string
  searchTxt?:string
}

export interface AvancementProjetDto{
  datation:Date;
  projetId:number;
  tauxType:string;
  taux?:number;
}

export interface AvancementProjetAnnuel {
  annee:number;
  projetId:number;
  t1Ante: AvancementProjetDto;
  t2Ante: AvancementProjetDto;
  t3Ante: AvancementProjetDto;
  t4Ante: AvancementProjetDto;
  t1Post: AvancementProjetDto;
  t2Post: AvancementProjetDto;
  t3Post: AvancementProjetDto;
  t4Post: AvancementProjetDto;
}

export interface AvancementProjetAnnuelDto {
  annee: number;
  projetId: number;
  t1Ante: number|null;
  t2Ante: number|null;
  t3Ante: number|null;
  t4Ante: number|null;
  t1Post: number|null;
  t2Post: number|null;
  t3Post: number|null;
  t4Post: number|null;
}
