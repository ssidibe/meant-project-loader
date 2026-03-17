import { Component, signal } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import * as bootstrap from 'bootstrap';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  collapsed = false;

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
}
