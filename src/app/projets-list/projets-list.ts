import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Button } from 'primeng/button';
import { ProjetService } from '../services/projet-service';
import { Fieldset } from 'primeng/fieldset';
import { ProjetDto } from '../domain.models';
import { JsonPipe, NgClass } from '@angular/common';
import { TableModule } from 'primeng/table';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { InputText } from 'primeng/inputtext';
import { Tag } from 'primeng/tag';
import { Router } from '@angular/router';
import { EntiteGouvListRowViewDto, ProjetListView } from '../ui.models';
import { Tooltip } from 'primeng/tooltip';

@Component({
  selector: 'app-projets-list',
  imports: [TableModule, Tooltip],
  templateUrl: './projets-list.html',
  styleUrl: './projets-list.scss',
})
export class ProjetsList implements OnInit {
  projetsView: ProjetListView = {
    objectifs: [],
    axes: [],
    entities: [],
    programmes: [],
    projets: [],
  };
  loading = false;
  protected representatives!: ProjetDto[];

  constructor(
    private readonly projetService: ProjetService,
    private readonly cdr: ChangeDetectorRef,
    private readonly router: Router,
  ) {}
  ngOnInit(): void {
    this.chargement();
  }

  chargement() {
    console.log('ProjetsList');
    this.projetService.getAllProjects().subscribe({
      next: (data) => {
        const projetViewTmp = data;
        console.log('projetViewTmp', projetViewTmp);
        projetViewTmp.projets.forEach((project) => {
          console.log('projetViewTmp.programmes1', projetViewTmp.programmes);
          console.log('programmeId', project.programmeId);
          project.programme = projetViewTmp.programmes.find((p) => p.id == project.programmeId);
          console.log('programmebbbbb', project.programme);
          project.os = projetViewTmp.objectifs.find((o) => o.id == project.programme?.osId);
          project.axe = projetViewTmp.axes.find((a) => a.id == project.os?.axeId);
        });
        this.projetsView = projetViewTmp;
        //this.cdr.detectChanges();
      },
      error: (err) => {
        console.log(err);
      },
      complete: () => {
        console.log('ok');
        this.cdr.detectChanges();
      },
    });
  }

  protected voirDetails(projetId: number) {
    console.log('voirDetails clique ', projetId);
    this.router.navigate(['/projets', projetId]);
  }
}
