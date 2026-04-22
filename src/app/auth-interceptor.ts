import {
  HttpBackend,
  HttpClient,
  HttpErrorResponse,
  HttpEvent,
  HttpHandlerFn,
  HttpInterceptorFn,
  HttpRequest,
} from '@angular/common/http';
import {
  BehaviorSubject,
  catchError,
  EMPTY,
  filter,
  Observable,
  switchMap,
  take,
  throwError,
} from 'rxjs';
import { environment } from '../environments/environment';
import { inject, isDevMode } from '@angular/core';
import { Mlog } from './mlog';

const AUTH_BASE = `${environment.API.BASE_URL}/${environment.API.SERVICES.AUTH}`;
const REFRESH_URL = `${AUTH_BASE}/refresh`;
const LOGIN_URL = environment.AUTH_URL;

let isRefreshing = false;
let isRedirecting = false;

const refreshTokenSubject = new BehaviorSubject<boolean>(false);

function isIgnoredUrl(url: string): boolean {
  return (
    url.includes('/auth/login') ||
    url.includes('/auth/refresh') ||
    url.includes('/assets') ||
    url.includes(LOGIN_URL)
  );
}

export const authInterceptor: HttpInterceptorFn = (req, next): Observable<HttpEvent<any>> => {
  // ⚠️ HttpClient SANS interceptor
  const httpBackend = inject(HttpBackend);


  // 🔴 1. Ignorer certaines requêtes
  if (isIgnoredUrl(req.url)) {
    return next(req);
  }

  // 🔴 2. Toujours envoyer les cookies
  const authReq = req.clone({ withCredentials: true });

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status !== 401) {
        return throwError(() => error);
      }
      return handle401(authReq, next, httpBackend);
    }),
  );
};;


/**
 * ========================
 * 🔁 HANDLE 401
 * ========================
 */
function handle401(
  req: HttpRequest<any>,
  next: HttpHandlerFn,
  httpBackend: HttpBackend
): Observable<HttpEvent<any>> {
  // 🟡 Si refresh en cours → on attend
  if (isRefreshing) {
    return refreshTokenSubject.pipe(
      filter((done) => done === true),
      take(1),
      switchMap(() => next(req)),
    );
  }

  // 🟢 Sinon → lancer refresh
  isRefreshing = true;
  refreshTokenSubject.next(false);

  const http = new HttpClient(httpBackend);
  log('REFRESH_URL', REFRESH_URL);

  return http.get(REFRESH_URL, { withCredentials: true }).pipe(
    switchMap(() => {
      // ✅ refresh OK
      isRefreshing = false;
      refreshTokenSubject.next(true);
      log("ok refresh")
      return next(req);
    }),

    catchError((err) => {
      // ❌ refresh KO → logout
      isRefreshing = false;
      refreshTokenSubject.next(false);
      log('erreur refresh code ', err.status);
      redirectToLogin();
      return EMPTY;
    }),
  );
}
/**
 * ========================
 * 🔐 REDIRECTION LOGIN
 * ========================
 */
function redirectToLogin() {
  if (isRedirecting) return;

  isRedirecting = true;

  const currentUrl = encodeURIComponent(window.location.href);

  window.location.href = `${LOGIN_URL}?origin=${currentUrl}`;
}

function log(...args: any):void{
  console.log(...args);
}
