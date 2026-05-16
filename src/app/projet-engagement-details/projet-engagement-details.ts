import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { EngagementService } from '../services/engagement-service';
import { Action, EngagementProjetDto, Indicateur, Structure } from '../domain.models';
import { Dialog } from 'primeng/dialog';
import { FormArray, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { FloatLabel } from 'primeng/floatlabel';
import { DatePicker } from 'primeng/datepicker';
import { Textarea } from 'primeng/textarea';
import { AutoComplete } from 'primeng/autocomplete';
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
    JsonPipe,
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
  maturites = ['Idée / intention', 'Études / préparation', 'Lancement', 'Avancé', 'Opérationnel'];
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
    this.msg='';
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

      this.loadEngagements();
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

  loadEngagements() {
    this.chargementIndicateurs = true;
    let noError = true;
    this.engagementService.getEngagesPopu().subscribe({
      next: (epData: EngagePopuDto[]) => {
        epData.forEach((epDto: EngagePopuDto) => {
          const domaines = new FormArray<any>([]);
          const epForm = new FormGroup({
            id: new FormControl(epDto.id),
            nom: new FormControl(epDto.nom),
            selected: new FormControl(epDto.selected),
            expanded: new FormControl(true),
            domaines: domaines,
          });
          this.engagesPopu.push(epForm);
          this.engagementService.getDomainesPrioritaires(epDto).subscribe({
            next: (dpData: DomainePrioDto[]) => {
              dpData.forEach((dpDto: DomainePrioDto) => {
                const focusArray = new FormArray<any>([]);
                const dpForm = new FormGroup({
                  id: new FormControl(dpDto.id),
                  nom: new FormControl(dpDto.nom),
                  selected: new FormControl(dpDto.selected),
                  expanded: new FormControl(true),
                  focusList: focusArray,
                });
                domaines.push(dpForm);
                this.engagementService.getFocusList(dpDto).subscribe({
                  next: (focusData) => {
                    focusData.forEach((focusDto: FocusDto) => {
                      const indicateursArray = new FormArray<any>([]);
                      const focusForm = new FormGroup({
                        id: new FormControl(focusDto.id),
                        nom: new FormControl(focusDto.nom),
                        selected: new FormControl(focusDto.selected),
                        expanded: new FormControl(true),
                        indicateurs: indicateursArray,
                      });
                      focusArray.push(focusForm);
                      this.engagementService.getIndicateursByFocus(focusDto).subscribe({
                        next: (indicData) => {
                          indicData.forEach((indicDto) => {
                            const indicForm = new FormGroup({
                              id: new FormControl(indicDto.id),
                              nom: new FormControl(indicDto.nom),
                              selected: new FormControl(
                                !!this.engagementProjet?.indicateurs.includes(indicDto.nom),
                              ),
                            });
                            indicateursArray.push(indicForm);
                          });
                        },
                        complete: () => {
                          this.cdr.detectChanges();
                        },
                      });
                    });
                  },
                  error: (err) => {
                    console.log(err);
                    this.msg = `${err}`;
                    noError = false;
                    this.cdr.detectChanges();
                  },
                  complete: () => {
                    this.cdr.detectChanges();
                  },
                });
              });
            },
            error: (err) => {
              console.log(err);
              this.msg = `${err}`;
              noError = false;
              this.cdr.detectChanges();
            },
            complete: () => {
              this.cdr.detectChanges();
            },
          });
        });
      },
      error: (err) => {
        console.log(err);
        this.msg = `${err}`;
        noError = false;
        this.cdr.detectChanges();
      },
      complete: () => {
        this.cdr.detectChanges();
      },
    });
  }

  get engagesPopu(): FormArray {
    return this.projetForm.get('engagementsPopu') as FormArray;
  }

  getDomainesPrioritaires(engageIndex: number): FormArray {
    return this.engagesPopu.at(engageIndex).get('domaines') as FormArray;
  }

  protected getFocusForm(epI: number, domI: number) {
    return this.getDomainesPrioritaires(epI).at(domI).get('focusList') as FormArray;
  }

  getIndicForm(epI: number, domI: number, focI: number) {
    return this.getFocusForm(epI, domI).at(focI).get('indicateurs') as FormArray;
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

  enregistrerIndicateurs() {
    const projetId: number = this.projetForm.controls['id'].value;
    const res: string[] = this.getSelectedIndicateurs();
    console.log('selection', res);

    this.engagementService.saveIndicateurs(projetId, res).subscribe({
      error: (err) => {
        console.log('erreur status ', err.status);
        this.msg = `Erreur code :${err.status}`;
      },
      complete: () => {
        console.log('enregistremnt ok');

        this.router.navigate(['/feuille-de-route']);
        //this.nextStep();
      },
    });
  }

  enregistrerFinances() {
    const projetId: number = this.projetForm.controls['id'].value;
    const financesForm = this.projetForm.get('finances') as FormGroup;
    const envTotale: number = financesForm.get('envTotale')?.value;
    const finePublic: number = financesForm.get('finePublic')?.value;
    const fineHorsBudget: number = financesForm.get('fineHorsBudget')?.value;
    const maturite: number = financesForm.get('maturite')?.value;
    const cibleUrbains: boolean = financesForm.get('cibleUrbains')?.value;
    const cibleRuraux: boolean = financesForm.get('cibleRuraux')?.value;
    const cibleFaiblesRevenus: boolean = financesForm.get('cibleFaiblesRevenus')?.value;
    const cibleHorsDakar: boolean = financesForm.get('cibleHorsDakar')?.value;
    const cibleTous: boolean = financesForm.get('cibleTous')?.value;

    console.log('envTotale', envTotale);
    console.log('finePublic', finePublic);
    console.log('fineHorsBudget', fineHorsBudget);
    console.log('maturite', maturite);
    console.log('cibleUrbains', cibleUrbains);
    console.log('cibleRuraux', cibleRuraux);
    console.log('cibleFaiblesRevenus', cibleFaiblesRevenus);
    console.log('cibleHorsDakar', cibleHorsDakar);
    console.log('cibleTous', cibleTous);

    const cibles: string[] = [];

    if (cibleUrbains) {
      cibles.push('Urbains');
    }

    if (cibleRuraux) {
      cibles.push('Ruraux');
    }

    if (cibleFaiblesRevenus) {
      cibles.push('faibles revenus');
    }
    if (cibleHorsDakar) {
      cibles.push('Hors Dakar');
    }

    if (cibleTous) {
      cibles.push('Tous');
    }

    const finances: ProjetFinanceDto = {
      projetId: projetId,
      envTotale: envTotale,
      finePublic: finePublic,
      fineHorsBudget: fineHorsBudget,
      maturite: maturite,
      cibles: cibles,
    };
    console.log('finances', finances);
    this.engagementService.saveFinances(finances).subscribe({
      error: (err) => {
        this.msg = `${err}`;
        this.cdr.detectChanges();
      },
      complete: () => {
        if (this.engagementProjet) {
          this.engagementProjet.cibles = cibles;
          this.nextStep();
          //////this.loadListAvancementsAnnuels();
        }
      },
    });
  }

  private getSelectedIndicateurs(): string[] {
    const res: string[] = [];
    for (let epIdx = 0; epIdx < this.engagesPopu.length; epIdx++) {
      const domArray = this.getDomainesPrioritaires(epIdx);
      for (let dpIdx = 0; dpIdx < domArray.length; dpIdx++) {
        const focArray = this.getFocusForm(epIdx, dpIdx);
        for (let focIdx = 0; focIdx < focArray.length; focIdx++) {
          const indicArray = this.getIndicForm(epIdx, dpIdx, focIdx);
          for (let indicIdx = 0; indicIdx < indicArray.length; indicIdx++) {
            const indicForm = indicArray.controls[indicIdx] as FormGroup;
            if (indicForm.get('selected')?.value) {
              res.push(indicForm.get('nom')?.value);
            }
          }
        }
      }
    }
    console.log('selectedIndicateurs', res);
    return res;
  }

  onClickEngagPop(pos: number) {
    const engForm = this.engagesPopu.at(pos).get('expanded');
    if (engForm) {
      engForm.setValue(!engForm.value);
    }
  }

  onClickDomainePrio(epIdx: number, domIdx: number) {
    const domForm = this.getDomainesPrioritaires(epIdx).at(domIdx).get('expanded');
    if (domForm) {
      domForm.setValue(!domForm.value);
    }
  }

  protected onClickFocus(epI: number, domI: number, focI: number) {
    const focForm = this.getFocusForm(epI, domI).at(focI).get('expanded');
    if (focForm) {
      focForm.setValue(!focForm.value);
    }
  }

  protected cibleTousChanged(event: Event) {
    const financeForm = this.projetForm.get('finances') as FormGroup;
    const cibleTousForm = financeForm?.get('cibleTous');
    const cibleUrbainsForm = financeForm?.get('cibleUrbains');
    const cibleRurauxForm = financeForm?.get('cibleRuraux');
    const cibleFaiblesRevenusForm = financeForm?.get('cibleFaiblesRevenus');
    const cibleHorsDakarForm = financeForm?.get('cibleHorsDakar');
    const cibleVal: boolean = cibleTousForm?.value;

    const formArray = [
      cibleUrbainsForm,
      cibleRurauxForm,
      cibleFaiblesRevenusForm,
      cibleHorsDakarForm,
    ];
    if (cibleVal) {
      for (let i = 0; i < formArray.length; i++) {
        formArray[i]?.setValue(true);
        formArray[i]?.disable();
      }
    } else {
      for (let i = 0; i < formArray.length; i++) {
        formArray[i]?.enable();
      }
    }
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
