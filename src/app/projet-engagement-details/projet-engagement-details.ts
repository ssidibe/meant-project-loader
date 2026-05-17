import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { EngagementService } from '../services/engagement-service';
import { Action, EngagementProjetDto, Indicateur, Structure } from '../domain.models';
import { Dialog } from 'primeng/dialog';
import { FormArray, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { TableModule } from 'primeng/table'
import {
  ActiviteDto,
  AvancementProjetAnnuel,
  AvancementProjetAnnuelDto,
  AvancementProjetDto,
  DomainePrioDto,
  EngagePopuDto,
  FocusDto,
  ProjetFinanceDto,
} from '../ui.models';
import { Step, StepList, StepPanel, StepPanels, Stepper } from 'primeng/stepper';
import { InputText } from 'primeng/inputtext';
import { Select } from 'primeng/select';
import { InputMaskDirective } from 'primeng/inputmask';
import { ProjetService } from '../services/projet-service';
import { expand } from 'rxjs';
import { CurrencyPipe, JsonPipe } from '@angular/common';
import { ExAntePostDetails } from '../fragments/ex-ante-post-details/ex-ante-post-details';
import { RecapIndicPilote } from '../fragments/recap-indic-pilote/recap-indic-pilote';
import { XofFormatPipe } from '../xof-format-pipe';
import { UtilService } from '../services/util-service';
import { JalonsProjet } from '../fragments/jalons-projet/jalons-projet';
import { ActivitesProjet } from '../fragments/activites-projet/activites-projet';
import { EtatsAvancements } from '../fragments/etats-avancements/etats-avancements';
import { IndicPilotage } from '../fragments/indic-pilotage/indic-pilotage';
import { FinancementsProjet } from '../fragments/financements-projet/financements-projet';


@Component({
  selector: 'app-projet-engagement-details',
  imports: [
    TableModule,
    ReactiveFormsModule,
    FormsModule,
    Stepper,
    StepList,
    StepPanels,
    Step,
    StepPanel,
    JalonsProjet,
    ActivitesProjet,
    EtatsAvancements,
    IndicPilotage,
    FinancementsProjet,
  ],
  templateUrl: './projet-engagement-details.html',
  styleUrl: './projet-engagement-details.scss',
})
export class ProjetEngagementDetails implements OnInit {
  etape: number = 1;
  poucentWidth = '45px';
  poucentPlaceHolder = '00';
  avancementProjetAnnuel?: AvancementProjetAnnuel;
  indicateursSource: Indicateur[] | undefined;
  chargement = false;
  projetId: number | undefined;
  chargementEngagement = false;

  selectedActiviteForm: FormGroup<any> = new FormGroup({
    id: new FormControl(''),
    index: new FormControl(''),
    activite: new FormControl('', Validators.required),
    porteur: new FormControl<Structure>(
      { nom: '', code: '', rattachement: null },
      Validators.required,
    ),
    partenaires: new FormControl<Structure[]>([], Validators.required),
    resultatsAttendus: new FormControl<string[]>([], Validators.required),
    debutEffectif: new FormControl('', [Validators.required]),
    finEffective: new FormControl('', [Validators.required]),
    debutPrevu: new FormControl('', [Validators.required]),
    finPrevue: new FormControl(new Date(), [Validators.required]),
  });

  projetForm: FormGroup = new FormGroup({
    id: new FormControl(0, [Validators.required]),
    numero: new FormControl(0, [Validators.required]),
    nom: new FormControl('', [Validators.required]),
    partenaires: new FormControl<Structure[]>([], Validators.required),
    resultatsAttendus: new FormControl<string[]>([], Validators.required),
    engagementsPopu: new FormArray([]),
    debutEffectif: new FormControl('', [Validators.required]),
    finEffective: new FormControl('', [Validators.required]),
    debutPrevu: new FormControl('', [Validators.required]),
    finPrevue: new FormControl(new Date(), [Validators.required]),
    activites: new FormArray([]),
    axeNum: new FormControl('', [Validators.required]),
    axeName: new FormControl('', [Validators.required]),
    osNum: new FormControl('', [Validators.required]),
    osName: new FormControl('', [Validators.required]),
    programme: new FormControl('', [Validators.required]),
    finances: new FormGroup({
      envTotale: new FormControl<number>(0),
      finePublic: new FormControl<number>(0),
      fineHorsBudget: new FormControl<number>(0),
      maturite: new FormControl<string>(''),
      cibleUrbains: new FormControl<boolean>(false),
      cibleRuraux: new FormControl<boolean>(false),
      cibleFaiblesRevenus: new FormControl<boolean>(false),
      cibleHorsDakar: new FormControl<boolean>(false),
      cibleTous: new FormControl<boolean>(false),
    }),
    annee: new FormControl<number>(0),
    exAntes: new FormArray([]),
    exPosts: new FormArray([]),
  });
  engagementProjet?: EngagementProjetDto;
  msg: string = '';
  private chargementIndicateurs: boolean = false;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly engagementService: EngagementService,
    private readonly cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const paramId = params.get('id');
      if (paramId) {
        this.projetId = +paramId;
        this.chargerDonnees(this.projetId);
      }
    });
  }

  private chargerDonnees(projetId: number) {
    this.setLoading(true);
    this.msg = '';
    this.engagementService.getEngagementByProjetId(projetId).subscribe({
      next: (engagementProjet: EngagementProjetDto) => {
        console.log('donnees reçu', engagementProjet);
        this.engagementProjet = engagementProjet;
      },
      error: (error) => {
        console.error('error', error);
        switch (error.status) {
          case 0:
            this.msg =
              "Problème de connexion au serveur. Vérifiez votre connexion. Si le problème persiste, contactez l'administrateur.";
            break;
          case 454:
            this.msg = `Le serveur chargé de faire le traitement est hors service`;
            break;
          case 503:
            this.msg = `Projet id=${projetId} introuvable`;
            break;
          default:
            this.msg = `Erreur code : ${status}`;
        }
        console.error(this.msg);
        this.setLoading(false);
      },
      complete: () => {
        console.log('done');
        ////////this.loadForm();
        console.log('engagement projet', this.engagementProjet);
        this.setLoading(false);
        //this.chargementsEngagementFromApi(projetId, year);
      },
    });
  }

  private loadForm() {
    if (this.engagementProjet) {
      console.log('load form engagement', this.engagementProjet);
      this.projetForm = new FormGroup({
        id: new FormControl(this.engagementProjet.projetId, [Validators.required]),
        numero: new FormControl(this.engagementProjet.projetNumero, [Validators.required]),
        nom: new FormControl(this.engagementProjet.nom, [Validators.required]),
        axeNum: new FormControl(this.engagementProjet.axeNum, [Validators.required]),
        axeName: new FormControl(this.engagementProjet.axeName, [Validators.required]),
        osNum: new FormControl(this.engagementProjet.osNum, [Validators.required]),
        osName: new FormControl(this.engagementProjet.osName, [Validators.required]),
        programme: new FormControl(this.engagementProjet.programme, [Validators.required]),

        partenaires: new FormControl<Structure[]>(
          this.engagementProjet.partenaires,
          Validators.required,
        ),
        resultatsAttendus: new FormControl<string[]>(
          this.engagementProjet.resultatsAttendus,
          Validators.required,
        ),
        debutEffectif: new FormControl(this.engagementProjet.debutEffectif, [Validators.required]),
        finEffective: new FormControl(this.engagementProjet.finEffective, [Validators.required]),
        debutPrevu: new FormControl(this.engagementProjet.debutPrevu, [Validators.required]),
        finPrevue: new FormControl(this.engagementProjet.finPrevue, [Validators.required]),
        activites: new FormArray([]),

        finances: new FormGroup({
          envTotale: new FormControl(this.engagementProjet.enveloppe),
          finePublic: new FormControl(this.engagementProjet.financementPublic),
          fineHorsBudget: new FormControl(this.engagementProjet.financementHorsBudget),
          maturite: new FormControl(this.engagementProjet.maturite),
          cibleUrbains: new FormControl<boolean>(
            !!this.engagementProjet.cibles?.includes('Urbains'),
          ),
          cibleRuraux: new FormControl<boolean>(!!this.engagementProjet.cibles?.includes('Ruraux')),
          cibleFaiblesRevenus: new FormControl<boolean>(
            !!this.engagementProjet.cibles?.includes('faibles revenus'),
          ),
          cibleHorsDakar: new FormControl<boolean>(
            !!this.engagementProjet.cibles?.includes('Hors Dakar'),
          ),
          cibleTous: new FormControl<boolean>(!!this.engagementProjet.cibles?.includes('Tous')),
        }),
        engagementsPopu: new FormArray([]),
        annee: new FormControl(new Date().getFullYear(), [Validators.required]),
        exAntes: new FormArray([]),
        exPosts: new FormArray([]),
      });

      ///this.loadEngagements();
      this.engagementProjet.actions.forEach((action) => {
        /////////this.addActivite(action);
      });
    } else {
      this.selectedActiviteForm = new FormGroup({
        id: new FormControl(''),
        index: new FormControl(''),
        activite: new FormControl('', Validators.required),
        porteur: new FormControl('', Validators.required),
        partenaires: new FormControl<string[]>([], Validators.required),
        resultatsAttendus: new FormControl<string[]>([], Validators.required),
        debutEffectif: new FormControl('', [Validators.required]),
        finEffective: new FormControl('', [Validators.required]),
        debutPrevu: new FormControl('', [Validators.required]),
        finPrevue: new FormControl(new Date(), [Validators.required]),
      });

      this.projetForm = new FormGroup({
        id: new FormControl(0, [Validators.required]),
        numero: new FormControl(0, [Validators.required]),
        nom: new FormControl('', [Validators.required]),
        partenaires: new FormControl<string[]>([], Validators.required),
        resultatsAttendus: new FormControl<string[]>([], Validators.required),
        debutEffectif: new FormControl('', [Validators.required]),
        finEffective: new FormControl('', [Validators.required]),
        debutPrevu: new FormControl('', [Validators.required]),
        finPrevue: new FormControl(new Date(), [Validators.required]),
        activites: new FormArray([]),
        engagementsPopu: new FormArray([]),
      });
    }

    this.cdr.detectChanges();
  }

  protected suivant(pas: number) {
    this.etape += pas;
    this.cdr.detectChanges();
  }

  protected nextStep(): void {
    this.etape = this.etape + 1;
    this.cdr.detectChanges();
  }

  protected previousStep(): void {
    console.log('previous step');
    this.etape = this.etape - 1;
    this.cdr.detectChanges();
  }



  protected onStepChange(activeIndex: number | undefined) {
    console.log('onStepChange', activeIndex);
    switch (activeIndex) {
      case 6:
        ///this.loadListAvancementsAnnuels();
        break;
    }
  }

  private setLoading(loading: boolean) {
    this.chargement = loading;
    this.cdr.detectChanges();
  }
}
