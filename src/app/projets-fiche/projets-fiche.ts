import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { BlockUI } from 'primeng/blockui';
import { Skeleton } from 'primeng/skeleton';
import { ProjetDto, ProjetListView } from '../ui.models';
import { EngagementService } from '../services/engagement-service';
import { Router } from '@angular/router';
import { JsonPipe } from '@angular/common';
import { ProjetFicheRow } from '../projet-fiche-row/projet-fiche-row';

@Component({
  selector: 'app-projets-fiche',
  templateUrl: './projets-fiche.html',
  styleUrl: './projets-fiche.scss',
  imports: [Skeleton, JsonPipe, ProjetFicheRow],
})
export class ProjetsFiche implements OnInit {
  errMsg: string = '';
  loading: boolean = false;
  selectedProjet: ProjetDto |undefined;
  listView: ProjetListView = {
    axes: [],
    projets: [],
    entities: [],
    objectifs: [],
    programmes: [],
  };

  constructor(
    private readonly engagementService: EngagementService,
    private readonly router: Router,
    private readonly cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.loadListView(null);
  }

  loadListView(event: any): void {
    this.listView = {
      axes: [],
      projets: [],
      entities: [],
      objectifs: [],
      programmes: [],
    };
    this.errMsg = '';
    this.setLoading(true);
    this.engagementService.getAllProjetListView().subscribe({
      next: (data) => {
        data.projets.forEach((projet) => {
          projet.programme = data.programmes.find((p) => p.id == projet.programmeId);
          projet.os = data.objectifs.find((o) => o.id == projet.programme?.osId);
          projet.axe = data.axes.find((a) => a.id == projet.os?.axeId);
          projet.porteur = data.entities.find((a) => a.id == projet.porteurId);
          projet.porteur = data.entities.find((a) => a.id == projet.porteurId);
          if (projet.porteur2Id) {
            projet.porteur2 = data.entities.find((a) => a.id == projet.porteur2Id);
          }
          if (projet.porteur3Id) {
            projet.porteur3 = data.entities.find((a) => a.id == projet.porteur3Id);
          }
        });
        this.listView = data;
      },
      error: (error) => {
        const status = error.status;
        if (status === 0) {
          this.errMsg = 'Erreur de connexion au serveur';
        } else if (status === 500) {
          this.errMsg = 'Erreur interne au serveur';
        }
        this.setLoading(false);
      },
      complete: () => {
        this.setLoading(false);
      },
    });
  }

  private setLoading(loading: boolean) {
    this.loading = loading;
    this.cdr.detectChanges();
  }

  onProjetSelectionne(projet: ProjetDto) {
    this.selectedProjet = projet;
  }
}
