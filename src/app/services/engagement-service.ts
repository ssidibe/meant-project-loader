import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ActiviteDto, AvancementProjetDto, ProjetListView } from '../ui.models';
import { EngagementProjetDto, Structure } from '../domain.models';

@Injectable({
  providedIn: 'root',
})
export class EngagementService {
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

  saveEngagementProjetDto(engagement: EngagementProjetDto): Observable<EngagementProjetDto> {
    const url = `${this.projetBaseUrl}/${engagement.projetId}`;
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.httpClient.put<EngagementProjetDto>(url, engagement, { headers: headers });
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
}
