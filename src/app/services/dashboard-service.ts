import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { RemplissageActivite } from '../ui.models';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  coreBaseUrl = `${environment.API.BASE_URL}/${environment.API.SERVICES.ENGAGEMENTS}`;
  projetBaseUrl = `${this.coreBaseUrl}/dashboard`;

  constructor(private readonly httpClient: HttpClient) {}

  getRemplissageActivite(): Observable<RemplissageActivite> {
    const url = `${this.projetBaseUrl}/activites/remplissage`;
    console.log('url', url);
    return this.httpClient.get<RemplissageActivite>(url);
  }
}
