import { Injectable } from '@angular/core';
import { EMPTY, Observable } from 'rxjs';
import { User } from '../domain.models';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class Auth {
  authBaseUrl = `${environment.API.BASE_URL}/${environment.API.SERVICES.AUTH}`;

  constructor(private readonly http: HttpClient) {}

  getUser(): Observable<User> {
    const url = `${this.authBaseUrl}/me`;
    console.log('url', url);
    return this.http.get<User>(url);
  }

  logout(): Observable<void> {
    const url = `${this.authBaseUrl}/deconnexion`;
    console.log('url logout', url);
    return this.http.get<void>(url);
  }
}
