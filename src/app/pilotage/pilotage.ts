import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { Menu } from 'primeng/menu';

@Component({
  selector: 'app-pilotage',
  imports: [RouterOutlet, Menu],
  templateUrl: './pilotage.html',
  styleUrl: './pilotage.scss',
})
export class Pilotage {
  pilotageRoute = '/pilotage';
  items: MenuItem[] = [
    { label: 'Axes', routerLink: `/${this.pilotageRoute}/axes` },
    { label: 'OS', routerLink: `/${this.pilotageRoute}/os` },
    { label: 'Programmes', routerLink: `/${this.pilotageRoute}/programmes` },
    { label: 'Projets', routerLink: `/${this.pilotageRoute}/projets` },
    { label: 'Indicateurs', routerLink: `/${this.pilotageRoute}/indicateurs` },
  ];
}
