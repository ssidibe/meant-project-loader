import { Routes } from '@angular/router';
import { ProjetsList } from './projets-list/projets-list';
import { ProjetsDetail } from './projets-detail/projets-detail';
import { ProjetsEdit } from './projets-edit/projets-edit';
import { EnConstruction } from './en-construction/en-construction';
import { ProjetEngagement } from './projet-engagement/projet-engagement';
import { ProjetEngagementDetails } from './projet-engagement-details/projet-engagement-details';
import { Pilotage } from './pilotage/pilotage';
import { Axes } from './pilotage/axes/axes';
import { Os } from './pilotage/os/os';
import { Programmes } from './pilotage/programmes/programmes';
import { Projets } from './pilotage/projets/projets';
import { Indicateurs } from './pilotage/indicateurs/indicateurs';

export const routes: Routes = [
  { path: '', redirectTo: 'projets', pathMatch: 'full' },
  { path: 'projets', component: ProjetsList },
  { path: 'projets/:numero', component: ProjetsDetail },
  { path: 'feuille-de-route', component: ProjetEngagement },
  { path: 'feuille-de-route/:id', component: ProjetEngagementDetails },
  { path: 'projets/:numero/edit', component: ProjetsEdit },
  {
    path: 'pilotage',
    component: Pilotage,
    children: [
      { path: '', redirectTo: 'axes', pathMatch: 'full' },
      { path: 'axes', component: Axes },
      { path: 'os', component: Os },
      { path: 'programmes', component: Programmes },
      { path: 'projets', component: Projets },
      { path: 'indicateurs', component: Indicateurs },
    ]
  },

  { path: '**', component: EnConstruction },
];
