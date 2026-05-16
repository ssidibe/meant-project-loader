import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FloatLabel } from 'primeng/floatlabel';
import { InputMaskDirective } from 'primeng/inputmask';
import { InputText } from 'primeng/inputtext';
import { FormArray, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Select } from 'primeng/select';
import { EngagementProjetDto } from '../../domain.models';
import { AvancementProjetAnnuelDto, AvancementProjetDto } from '../../ui.models';
import { ActivatedRoute, Router } from '@angular/router';
import { EngagementService } from '../../services/engagement-service';
import { LoadingData } from '../loading-data/loading-data';

@Component({
  selector: 'app-etats-avancements',
  imports: [FloatLabel, InputMaskDirective, InputText, ReactiveFormsModule, Select, LoadingData],
  templateUrl: './etats-avancements.html',
  styleUrl: './etats-avancements.scss',
})
export class EtatsAvancements implements OnInit {
  @Input()
  projetId: number | undefined;

  @Output()
  etapeEmitter: EventEmitter<number> = new EventEmitter<number>();

  projetForm = new FormGroup({
    annee: new FormControl<number>(new Date().getFullYear()),
    exAntes: new FormArray([]),
    exPosts: new FormArray([]),
  });

  annees: number[] = [];
  exTypes = ['EX_ANTE', 'EX_POST'];
  trimestreMonth = [2, 5, 8, 11];
  chargementListExAntePost: boolean = false;
  chargementListExAntePostError: string = '';
  listExAntePost: AvancementProjetAnnuelDto[] = [];
  engagementProjet?: EngagementProjetDto;
  msg = '';
  chargement = false;
  saving: boolean = false;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly engagementService: EngagementService,
    private readonly cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    console.log('EtatsAvancements oninit ');
    if (this.projetId) {
      for (let annee = 2024; annee < 2036; annee++) {
        this.annees.push(annee);
      }
      this.updateEngagementYear();
    }
  }

  protected updateEngagementYear() {
    console.log('updateEngagementYear');
    if (this.projetForm) {
      const year = this.projetForm.get('annee')?.value;
      this.exAntes.clear();
      this.exPosts.clear();
      if (this.projetId && year) {
        this.chargementsEngagementFromApi(this.projetId, year);
      }
    }
  }

  get exPosts(): FormArray {
    return this.projetForm.get('exPosts') as FormArray;
  }

  private createProjetForm(annee: number) {
    return new FormGroup({
      annee: new FormControl<number>(annee),
      exAntes: new FormArray([]),
      exPosts: new FormArray([]),
    });
  }

  exAntesAt(index: number, projetId:number): AvancementProjetDto {
    const avancementForm = this.exAntes.at(index) as FormGroup;
      return {
        projetId: projetId,
        datation: avancementForm.controls['datation'].value,
        tauxType: avancementForm.controls['tauxType'].value,
        taux: avancementForm.controls['taux'].value,
        commentaire: avancementForm.controls['commentaire'].value,
      };
  }

  exPostsAt(index: number, projetId:number): AvancementProjetDto {
    const avancementForm = this.exPosts.at(index) as FormGroup;
    return {
      projetId: projetId,
      datation: avancementForm.controls['datation'].value,
      tauxType: avancementForm.controls['tauxType'].value,
      taux: avancementForm.controls['taux'].value,
      commentaire: avancementForm.controls['commentaire'].value,
    };
  }

  get exAntes(): FormArray {
    return this.projetForm.get('exAntes') as FormArray;
  }

  enregistrerAvancement() {
    const annee = this.projetForm.controls['annee'].value;
    if (this.projetId && annee) {
      this.setSaving(true);
      const avancements: AvancementProjetDto[] = [];
      for (let i = 0; i < 4; i++) {
        avancements.push(this.exAntesAt(i, this.projetId));
        avancements.push(this.exPostsAt(i, this.projetId));
      }
      this.engagementService.saveAvancements(this.projetId, annee, avancements).subscribe({
        error: (err) => {
          switch (err.status) {
            case 500 :
              this.msg='Erreur interne du serveur';
              break;
            case 503 :
              this.msg = 'Impossible d’accéder au serveur des feuilles de route. Veuillez réessayer plus tard.';
              break;
            default:
              this.msg = `Erreur code :${err.status}`;
          }
          this.setSaving(false)
          this.cdr.detectChanges();
        },
        complete: () => {
          this.setSaving(false);
          this.etapeEmitter.emit(1)
        },
      });
    }
  }

  chargementsEngagementFromApi(projetId: number, year: number) {
    this.setLoading(true);
    this.projetForm=this.createProjetForm(year)
    this.engagementService.getEngagementTauxProjetId(projetId, year).subscribe({
      next: (data) => {
        console.log('data', data);
        this.exTypes.forEach((exType) => {
          this.trimestreMonth.forEach((mois) => {
            const avancementProjet = data.find(
              (a) => new Date(a.datation).getMonth() === mois && a.tauxType === exType,
            ) ?? {
              datation: new Date(year, mois, 1),
              projetId: projetId,
              tauxType: exType,
            };
            console.log('avancementProjet', avancementProjet);

            const form = new FormGroup({
              projetId: new FormControl(avancementProjet.projetId),
              datation: new FormControl(avancementProjet.datation),
              tauxType: new FormControl(avancementProjet.tauxType),
              taux: new FormControl(avancementProjet.taux, [
                Validators.min(0),
                Validators.max(100),
              ]),
              commentaire: new FormControl(avancementProjet.commentaire),
            });
            if (avancementProjet.tauxType === 'EX_ANTE') {
              console.log('ex-ante');
              this.exAntes.push(form);
            } else if (avancementProjet.tauxType === 'EX_POST') {
              console.log('ex-post');
              this.exPosts.push(form);
            }
          });
        });
      },
      error: (error) => {
        console.log('error', error);
        switch (error.status) {
          case 0:
            break;
        }
        this.setLoading(false);
      },
      complete: () => {
        console.log('nb', this.exAntes.controls.length);
        this.setLoading(false);
      },
    });
  }

  protected previousStep() {
    this.etapeEmitter.emit(-1);
  }

  private setLoading(loading: boolean) {
    this.chargement = loading;
    this.cdr.detectChanges();
  }

  private setSaving(saving: boolean) {
    this.saving = saving;
    this.exAntes.controls.forEach( ex=>{
        const exFormGroup = ex as FormGroup;
        if (saving){
          exFormGroup.get('taux')?.disable({ emitEvent: false });
          exFormGroup.get('commentaire')?.disable({ emitEvent: false });
        }else{
          exFormGroup.get('taux')?.enable({ emitEvent: false });
          exFormGroup.get('commentaire')?.enable({ emitEvent: false });
        }
    });

    this.exPosts.controls.forEach((ex) => {
      const exFormGroup = ex as FormGroup;
      if (saving) {
        exFormGroup.get('taux')?.disable({ emitEvent: false });
        exFormGroup.get('commentaire')?.disable({ emitEvent: false });
      } else {
        exFormGroup.get('taux')?.enable({ emitEvent: false });
        exFormGroup.get('commentaire')?.enable({ emitEvent: false });
      }
    });

    this.cdr.detectChanges();
  }

  private chargerDonnees(projetId: number, year: number) {
    this.setLoading(true);
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
        this.setLoading(false);
      },
      complete: () => {
        console.log('done');
        ////////this.loadForm();
        this.setLoading(false);
        this.chargementsEngagementFromApi(projetId, year);
      },
    });
    console.log('getEngagementTauxProjetId ', projetId, year);
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
}
