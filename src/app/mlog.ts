import { Injectable, isDevMode } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class Mlog {
  log(...args: any) {
    if (isDevMode()) {
      console.log(args);
    }
  }

  error(...args: any) {
    if (isDevMode()) {
      console.error(args);
    }
  }
}
