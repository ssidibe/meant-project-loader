import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { EngagementProjetDto } from '../../domain.models';
import { ExAntePostDetails } from '../ex-ante-post-details/ex-ante-post-details';
import { AvancementProjetAnnuelDto } from '../../ui.models';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { EngagementService } from '../../services/engagement-service';
import { RecapIndicPilote } from '../recap-indic-pilote/recap-indic-pilote';
import { XofFormatPipe } from '../../xof-format-pipe';

@Component({
  selector: 'app-recap-projet',
  imports: [ExAntePostDetails, RecapIndicPilote, XofFormatPipe, RouterLink],
  templateUrl: './recap-projet.html',
  styleUrl: './recap-projet.scss',
})
export class RecapProjet implements OnInit {
  @Input()
  projetId: number | undefined;

  @Output()
  etapeEmitter = new EventEmitter<number>();

  engagementProjet?: EngagementProjetDto;

  listExAntePost: AvancementProjetAnnuelDto[] = [];
  chargementListExAntePostError: string = '';
  chargementListExAntePost: boolean = false;
  loadingProjet: boolean = false;
  msg: string = '';

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly engagementService: EngagementService,
    private readonly cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    if (this.projetId) {
      this.chargerProjet(this.projetId);
    }
  }

  private loadListAvancementsAnnuels() {
    this.chargementListExAntePostError = '';
    this.listExAntePost = [];
    if (this.engagementProjet) {
      this.engagementService.loadRecap(this.engagementProjet.projetId).subscribe({
        next: (data) => {
          this.listExAntePost = data;
          console.log('listProjetsAnnuels', data);
        },
        error: (err) => {
          this.chargementListExAntePostError = `${err}`;
          this.chargementListExAntePost = false;
          this.cdr.detectChanges();
        },
        complete: () => {
          this.chargementListExAntePost = false;
          this.cdr.detectChanges();
        },
      });
    } else {
      this.chargementListExAntePostError = 'pas de projet selectionné';
    }
  }

  private chargerProjet(projetId: number) {
    this.setLoadingProjet(true);
    this.engagementService.getEngagementByProjetId(projetId).subscribe({
      next: (engagementProjet: EngagementProjetDto) => {
        console.log('donnees reçu', engagementProjet);
        this.engagementProjet = engagementProjet;
      },
      error: (error) => {
        console.error('error', error);
        const status = error.status;
        if (status === 454) {
          this.msg = `Engagement du projet id=${projetId} introuvable`;
        } else {
          console.error(`Erreur code : ${status}, ${error}`);
          this.msg = `Erreur code : ${status}`;
        }
        this.setLoadingProjet(false);
      },
      complete: () => {
        console.log('done');
        ////////this.loadForm();
        this.setLoadingProjet(false);
      },
    });
  }

  private setLoadingProjet(loadingProjet: boolean) {
    this.loadingProjet = loadingProjet;
    this.cdr.detectChanges();
  }

  protected previousStep() {
    this.etapeEmitter.emit(-1);
  }
}
