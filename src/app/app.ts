import { Component, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import * as bootstrap from 'bootstrap';
import { NgOptimizedImage } from '@angular/common';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, NgOptimizedImage, RouterLinkActive],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  collapsed = false;
  selectedPath = '';

  constructor(private readonly router: Router) {}

  toggleSidebar() {
    this.collapsed = !this.collapsed;
  }

  logout() {
    console.log('Déconnexion...');
  }

  openLogoutModal() {
    const modalEl = document.getElementById('logoutModal');
    if (modalEl) {
      const modal = new bootstrap.Modal(modalEl);
      modal.show();
    }
  }

  protected selectMenu(path: string) {
    this.router.navigate([path]).then((success) => {
      if (success) {
        this.selectedPath = path;
      }
    });
  }
}
