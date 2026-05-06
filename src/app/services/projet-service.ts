import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Indicateur, ProjetDto } from '../domain.models';
import { ProjetListView } from '../ui.models';

@Injectable({
  providedIn: 'root',
})
export class ProjetService {
  coreBaseUrl = `${environment.API.BASE_URL}/${environment.API.SERVICES.CORE}`;
  projetBaseUrl = `${this.coreBaseUrl}/projets`;
  constructor(private readonly httpClient: HttpClient) {}

  getAllProjects(): Observable<ProjetListView> {
    return this.httpClient.get<ProjetListView>(this.projetBaseUrl);
  }

  getProjects(page: number, size: number): Observable<ProjetListView> {
    return this.httpClient.get<ProjetListView>(this.projetBaseUrl);
  }

  getDetails(id: string | null): Observable<ProjetDto> {
    const url = `${this.projetBaseUrl}/${id}`;
    return this.httpClient.get<ProjetDto>(url);
  }

  getAllIndicateurs(): Observable<Indicateur[]> {
    const url = `${this.coreBaseUrl}/indicateurs`;
    return this.httpClient.get<Indicateur[]>(url);
  }

}
