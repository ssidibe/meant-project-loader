import { Injectable } from '@angular/core';
import { EMPTY, Observable } from 'rxjs';
import { User } from '../app.models';

@Injectable({
  providedIn: 'root',
})
export class Auth {
  private STORAGE_AUTH_USER: string = 'auth_user';

  logout():Observable<void> {
    localStorage.removeItem(this.STORAGE_AUTH_USER);
    return EMPTY;
  }

  getAuthenticatedUser(): User | null {
    const user= localStorage.getItem(this.STORAGE_AUTH_USER);
    if (user) {
      return JSON.parse(user);
    }
    return null;
  }

  isLoggedIn(): boolean {
    return this.getAuthenticatedUser()==null;
  }
}
