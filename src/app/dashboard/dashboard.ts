import { Component } from '@angular/core';
import { Tab, TabList, TabPanel, TabPanels, Tabs } from 'primeng/tabs';
import { EnConstruction } from '../en-construction/en-construction';
import { ActiviteDash } from './activite-dash/activite-dash';
import { ProjetDash } from './projet-dash/projet-dash';
import { ProgrammeDash } from './programme-dash/programme-dash';
import { OsDash } from './os-dash/os-dash';
import { AxeDash } from './axe-dash/axe-dash';

@Component({
  selector: 'app-dashboard',
  imports: [
    Tabs,
    TabList,
    Tab,
    TabPanels,
    TabPanel,
    EnConstruction,
    ActiviteDash,
    ProjetDash,
    ProgrammeDash,
    OsDash,
    AxeDash,
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard {}
