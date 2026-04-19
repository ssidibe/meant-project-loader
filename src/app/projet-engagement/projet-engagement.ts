import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { ProjetDto, ProjetListView, TabCol } from '../ui.models';
import { EngagementService } from '../services/engagement-service';
import { DatePipe } from '@angular/common';
import { Table, TableModule } from 'primeng/table';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Skeleton } from 'primeng/skeleton';
import { Button } from 'primeng/button';
import { Tooltip } from 'primeng/tooltip';
import { MultiSelect } from 'primeng/multiselect';

@Component({
  selector: 'app-projet-engagement',
  imports: [TableModule, FormsModule, DatePipe, Skeleton, Button, Tooltip, MultiSelect],
  templateUrl: './projet-engagement.html',
  styleUrl: './projet-engagement.scss',
})
export class ProjetEngagement implements OnInit {
  @ViewChild('dataTable') table: Table | undefined;
  first = 0;
  rows = 5;
  chargementList: boolean = false;
  selectedProjet: ProjetDto|undefined;
  colonnes: TabCol[] = [
    {
      entete: 'Axe',
      champ: 'axe.nom',
      searchTxt: 'Recherche axe',
    },
    {
      entete: 'Objectifs stratégiques',
      champ: 'os.nom',
      searchTxt: 'Recherche OS',
    },
    {
      entete: 'Programme',
      champ: 'programme.nom',
      searchTxt: 'Recherche programme',
    },
    {
      entete: 'Projet',
      champ: 'nom',
      searchTxt: 'Recherche projet',
    },
    {
      entete: 'Porteur',
      champ: 'porteur.code',
      searchTxt: 'Recherche porteur',
    },
    {
      entete: 'Partenaires',
      champ: 'partenaires',
    },
    {
      entete: 'Début prévu',
      champ: 'debutPrevu',
    },
    {
      entete: 'Début réel',
      champ: 'debutEffectif',
    },
    {
      entete: 'Fin prévue',
      champ: 'finPrevue',
    },
    {
      entete: 'Fin réelle',
      champ: 'finEffective',
    },
  ];

  selectedColumns: TabCol[] = this.colonnes;

  listView: ProjetListView = {
    axes: [],
    projets: [],
    entities: [],
    objectifs: [],
    programmes: [],
  };
  errMsg: string = '';
  skeletonHeight = '6rem';

  constructor(
    private readonly engagementService: EngagementService,
    private readonly router: Router,
    private readonly cdr: ChangeDetectorRef,
  ) {}

  ngOnInit() {
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
    this.setChargement(true);
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
        this.setChargement(false);
      },
      complete: () => {
        this.setChargement(false);
      },
    });
  }

  protected detailsProjet(projetId: number) {
    this.router.navigate(['/feuille-de-route', projetId]);
  }

  private setChargement(chargement: boolean) {
    this.chargementList = chargement;
    this.cdr.detectChanges();
  }

  protected recharger() {
    // Reset à la première page
    if (this.table) {
      console.log('recharger table');
      //this.table.reset();

      // OU déclencher manuellement le lazy loading
      const lazyEvent = this.table.createLazyLoadMetadata();
      this.loadListView(lazyEvent);
    }
  }

  next() {
    this.first = this.first + this.rows;
    if (this.table) {
      console.log('next recharger table');
    }
  }

  prev() {
    this.first = this.first - this.rows;
  }

  pageChange(event: any) {
    console.log('pageChange', event);
    this.first = event.first;
    this.rows = event.rows;
  }

  isLastPage(): boolean {
    return this.listView.projets ? this.first + this.rows >= this.listView.projets.length : true;
  }

  isFirstPage(): boolean {
    return this.listView.projets ? this.first === 0 : true;
  }

  getNestedValue(obj: any, path: string) {
    return path.split('.').reduce((current, key) => {
      return current?.[key];
    }, obj);
  }

  protected selectProjet(projet: ProjetDto) {
    this.selectedProjet = projet;
  }
}
