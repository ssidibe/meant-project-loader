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

export interface IndicateursViewDto{

}

export interface AxeDto {
  numero: number;
  nom: string;
  id: number;
}

export interface OsDto {
  id: number;
  numero: number;
  nom: string;
  axeId: number;
}

export interface EngagePopuDto{
  id: number;
  nom: string;
  selected:boolean;
  loading:true
}
export interface DomainePrioDto {
  id: number;
  nom: string;
  selected: boolean;
  loading: true;
}


export interface FocusDto {
  id: number;
  nom: string;
  cibleId: number;
  domainePrioId: number;
  selected: boolean;
  loading: true;
}

export interface IndicateurDto {
  id: number;
  nom: string;
  focusId: number;
  selected: boolean;
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
  porteur: Structure | null | undefined;
  partenaires: Structure[] | null | undefined;
  resultatsAttendus: string[] | null | undefined;
  projetId: number;
  debutPrevu: string | null | undefined;
  debutEffectif: string | null | undefined;
  finPrevue: string | null | undefined;
  finEffective?: string | null | undefined;
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
  commentaire?:string;
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
  t1Ante: number | undefined;
  t2Ante: number | undefined;
  t3Ante: number | undefined;
  t4Ante: number | undefined;
  t1Post: number | undefined;
  t2Post: number | undefined;
  t3Post: number | undefined;
  t4Post: number | undefined;

  t1AnteComm: string | undefined;
  t2AnteComm: string | undefined;
  t3AnteComm: string | undefined;
  t4AnteComm: string | undefined;
  t1PostComm: string | undefined;
  t2PostComm: string | undefined;
  t3PostComm: string | undefined;
  t4PostComm: string | undefined;
}

export interface ToastMsg {
  severity: string;
  summary: string;
  detail: string;
  life: number;
}

export interface Cible {
  id: number;
  nom: string;
  ordre: number;
}

export interface ProjetFinanceDto {
  projetId: number;
  envTotale: number | null;
  finePublic: number | null;
  fineHorsBudget: number | null;
  maturite: string | null;
  cibles: string[];
}

export interface JalonProjetDto {
  projetId: number;
  porteur?: string;
  partenaires: Structure[];
  resultatsAttendus: string[];
  debutPrevu: string;
  debutEffectif: string;
  finPrevue: string;
  finEffective: string;
}
