import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Tab, TabList, TabPanel, TabPanels, Tabs } from 'primeng/tabs';

import { RemplissageActivite } from '../../ui.models';
import { DashboardService } from '../../services/dashboard-service';
import { JsonPipe } from '@angular/common';

@Component({
  selector: 'app-activite-dash',
  imports: [Tab, TabList, Tabs, TabPanels, TabPanel, JsonPipe],
  templateUrl: './activite-dash.html',
  standalone: true,
  styleUrl: './activite-dash.scss',
})
export class ActiviteDash implements OnInit {



  remplissage?: RemplissageActivite;
  remplissageLoading = false;

  constructor(
    private readonly dashboardService: DashboardService,
    private readonly cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.loadRemplissage();
  }

  private loadRemplissage() {
    this.remplissageLoading = true;
    this.dashboardService.getRemplissageActivite().subscribe({
      next: (data) => {
        this.remplissage = data;
        console.log('data', data);
      },
      error: (err) => {
        console.log(err);
        this.remplissageLoading = false;
        this.cdr.detectChanges();
      },
      complete: () => {
        this.remplissageLoading = false;
        this.cdr.detectChanges();
      },
    });
  }
}
