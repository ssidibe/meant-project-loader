import { ChangeDetectorRef, Component, DOCUMENT, Inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import * as bootstrap from 'bootstrap';
import { NgOptimizedImage } from '@angular/common';
import { Auth } from './services/auth';
import { User } from './domain.models';
import { Avatar } from 'primeng/avatar';
import { BadgeDirective } from 'primeng/badge';
import { environment } from '../environments/environment';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, NgOptimizedImage, RouterLinkActive, Avatar, BadgeDirective],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App implements OnInit {
  collapsed = false;
  selectedPath = '';
  user: User | undefined;

  constructor(
    @Inject(DOCUMENT) private document: Document,
    private readonly router: Router,
    private auth: Auth,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.auth.getUser().subscribe({
      next: (data) => {
        this.user = data;
        console.log(this.user);
        this.cdr.detectChanges();
      },
    });
  }

  toggleSidebar() {
    this.collapsed = !this.collapsed;
  }

  logout() {
    this.auth.logout().subscribe({
      error:(err)=>{
        console.log(`ne peut se déconnecter ${err}`);
      },
      complete: ()=>{
        const currentUrl = this.document.location.href;
        console.log('dest ',environment.AUTH_URL);
        console.log('currentUrl', currentUrl);
        const newUrl = `${environment.AUTH_URL}?origin=${encodeURIComponent(currentUrl)}`;
        console.log('newUrl', newUrl);
        this.document.location.href=newUrl;
      }
    });
  }

  openLogoutModal() {
    const modalEl = document.getElementById('logoutModal');
    if (modalEl) {
      const modal = new bootstrap.Modal(modalEl);
      modal.show();
    }
  }

}
