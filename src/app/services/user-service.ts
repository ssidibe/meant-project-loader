import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';
import { UserDto } from '../domain.models';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  authBaseUrl = `${environment.API.BASE_URL}/${environment.API.SERVICES.AUTH}`;

  constructor(private http: HttpClient) {}

  getAllUsers():Observable<UserDto[]>{
    const url = `${this.authBaseUrl}/users`;
    console.log('url', url);
    return this.http.get<UserDto[]>(url);
  }
}
