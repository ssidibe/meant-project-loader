import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient, HttpEvent, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  ActiviteDto,
  AvancementProjetAnnuelDto,
  AvancementProjetDto,
  Cible,
  DomainePrioDto,
  EngagePopuDto,
  FicheProjetDto,
  FocusDto,
  IndicateurDto,
  JalonProjetDto,
  ProjetFinanceDto,
  ProjetListView,
} from '../ui.models';
import { EngagementProjetDto, Structure } from '../domain.models';

@Injectable({
  providedIn: 'root',
})
export class EngagementService {
  coreBaseUrl = `${environment.API.BASE_URL}/${environment.API.SERVICES.CORE}`;
  engagementBaseUrl = `${environment.API.BASE_URL}/${environment.API.SERVICES.ENGAGEMENTS}`;
  projetBaseUrl = `${this.engagementBaseUrl}/projets`;
  constructor(private readonly httpClient: HttpClient) {}

  getAllProjetListView(): Observable<ProjetListView> {
    console.log('projetBaseUrl', this.projetBaseUrl);
    return this.httpClient.get<ProjetListView>(this.projetBaseUrl);
  }

  getProjetListView(page: number, size: number): Observable<ProjetListView> {
    return this.httpClient.get<ProjetListView>(this.projetBaseUrl);
  }

  getEngagementByProjetId(projetId: number): Observable<EngagementProjetDto> {
    const url = `${this.projetBaseUrl}/${projetId}`;
    return this.httpClient.get<EngagementProjetDto>(url);
  }

  getEngagementTauxProjetId(projetId: number, annee: number): Observable<AvancementProjetDto[]> {
    const url = `${this.projetBaseUrl}/${projetId}/avancements/${annee}`;
    return this.httpClient.get<AvancementProjetDto[]>(url);
  }

  saveJalonProjet(engagement: JalonProjetDto): Observable<void> {
    const url = `${this.projetBaseUrl}/${engagement.projetId}/jalon`;
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.httpClient.put<void>(url, engagement, { headers: headers });
  }

  createActivite(activite: ActiviteDto): Observable<EngagementProjetDto> {
    const url = `${this.projetBaseUrl}/${activite.projetId}/activites`;
    console.log('url', url);
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.httpClient.post<EngagementProjetDto>(url, activite, { headers: headers });
  }

  getAllPartenaires(): Observable<Structure[]> {
    const url = `${this.engagementBaseUrl}/structures`;
    return this.httpClient.get<Structure[]>(url);
  }

  saveAvancements(
    projetId: number,
    annee: number,
    avancements: AvancementProjetDto[],
  ): Observable<void> {
    const url = `${this.projetBaseUrl}/${projetId}/avancements/${annee}`;
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    console.log('enregistrement avancements', avancements);
    return this.httpClient.put<void>(url, avancements, { headers: headers });
  }

  saveIndicateurs(projetId: number, indicateurs: string[]): Observable<void> {
    const url = `${this.projetBaseUrl}/${projetId}/indicateurs`;
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    console.log('enregistrement indicateurs', projetId, indicateurs);
    return this.httpClient.put<void>(url, indicateurs, { headers: headers });
  }

  uploadFicheProjet(projetId: number, ficheProjet: File): Observable<HttpEvent<FicheProjetDto>> {
    const url = `${this.projetBaseUrl}/${projetId}/fiche-projet/upload`;
    console.log('envoi du fichier url', url);
    const formData = new FormData();
    formData.append('ficheProjet', ficheProjet);
    return this.httpClient.post<FicheProjetDto>(url, formData, {
      reportProgress: true,
      observe: 'events',
    });
  }

  getEngagesPopu(): Observable<EngagePopuDto[]> {
    const url = `${this.coreBaseUrl}/indicateurs/engages-popu`;
    return this.httpClient.get<EngagePopuDto[]>(url);
  }

  getDomainesPrioritaires(engagePopuDto: EngagePopuDto): Observable<DomainePrioDto[]> {
    const url = `${this.coreBaseUrl}/indicateurs/engages-popu/${engagePopuDto.id}/domaines-prio`;
    return this.httpClient.get<DomainePrioDto[]>(url);
  }

  getFocusList(domaine: DomainePrioDto): Observable<FocusDto[]> {
    const url = `${this.coreBaseUrl}/indicateurs/domaines-prio/${domaine.id}/focus`;
    return this.httpClient.get<FocusDto[]>(url);
  }

  getIndicateursByFocus(focusDto: FocusDto): Observable<IndicateurDto[]> {
    const url = `${this.coreBaseUrl}/indicateurs/focus/${focusDto.id}/indicateurs`;
    return this.httpClient.get<IndicateurDto[]>(url);
  }

  saveFinances(finances: ProjetFinanceDto): Observable<void> {
    const url = `${this.projetBaseUrl}/${finances.projetId}/finances`;
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    console.log('enregistrement finance', finances);
    return this.httpClient.put<void>(url, finances, { headers: headers });
  }

  loadRecap(projetId: number): Observable<AvancementProjetAnnuelDto[]> {
    const url = `${this.projetBaseUrl}/${projetId}/avancements-annuels`;
    return this.httpClient.get<AvancementProjetAnnuelDto[]>(url);
  }
}
