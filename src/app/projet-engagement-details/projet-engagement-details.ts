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
  AvancementProjetDto,
  DomainePrioDto,
  EngagePopuDto,
  FocusDto, ProjetFinanceDto,
} from '../ui.models';
import { Step, StepList, StepPanel, StepPanels, Stepper } from 'primeng/stepper';
import { InputText } from 'primeng/inputtext';
import { Select } from 'primeng/select';
import { InputMaskDirective } from 'primeng/inputmask';
import { ProjetService } from '../services/projet-service';
import { expand } from 'rxjs';


@Component({
  selector: 'app-projet-engagement-details',
  imports: [
    Dialog,
    TableModule,
    ReactiveFormsModule,
    FloatLabel,
    DatePicker,
    Textarea,
    AutoComplete,
    FormsModule,
    Stepper,
    StepList,
    StepPanels,
    Step,
    StepPanel,
    InputText,
    Select,
    InputMaskDirective,
  ],
  templateUrl: './projet-engagement-details.html',
  styleUrl: './projet-engagement-details.scss',
})
export class ProjetEngagementDetails implements OnInit {
  etape: number = 6;
  maturites = ['Idée / intention', 'Études / préparation', 'Lancement', 'Avancé', 'Opérationnel'];
  annees: number[] = [2024, 2025, 2026, 2027, 2028, 2029, 2031, 2032, 2033, 2034, 2035];
  trimestreMonth = [2, 5, 8, 11];
  poucentWidth = '45px';
  poucentPlaceHolder = '00';
  avancementProjetAnnuel?: AvancementProjetAnnuel;
  indicateursSource: Indicateur[] | undefined;
  chargementIndicateurs: boolean = false;

  projetId: number | null = null;
  engagementProjet?: EngagementProjetDto;
  msg = '';
  chargement = false;
  chargementEngagement = false;

  filteredPartenaires: Structure[] = [];
  partenairesDb: Structure[] = [];

  editMode = false;

  chargementPartenaires: boolean = false;

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

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly engagementService: EngagementService,
    private readonly projetService: ProjetService,
    private readonly cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const paramId = params.get('id');
      if (paramId) {
        this.projetId = +paramId;
        this.chargerDonnees(this.projetId, new Date().getFullYear());
      }
      this.loadPartenaireDb();
    });
  }

  private chargerDonnees(projetId: number, year: number) {
    this.setChargement(true);
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
        this.setChargement(false);
      },
      complete: () => {
        console.log('done');
        this.loadForm();
        this.setChargement(false);
        this.chargementsEngagementFromApi(projetId, year);
      },
    });

    console.log('getEngagementTauxProjetId ', projetId, year);
  }

  chargementsEngagementFromApi(projetId: number, year: number) {
    this.setChargementEngagement(true);
    this.projetForm.get('annee')?.setValue(year);
    this.exAntes.clear();
    this.exPosts.clear();
    this.engagementService.getEngagementTauxProjetId(projetId, year).subscribe({
      next: (data) => {
        console.log('data', data);
        const exTypes = ['EX_ANTE', 'EX_POST'];
        exTypes.forEach((exType) => {
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
        this.setChargementEngagement(false);
      },
      complete: () => {
        console.log('nb', this.exAntes.controls.length);
        this.setChargementEngagement(false);
      },
    });
  }

  private setChargement(chargement: boolean) {
    this.chargement = chargement;
    this.cdr.detectChanges();
  }

  private setChargementEngagement(chargement: boolean) {
    this.chargementEngagement = chargement;
    this.cdr.detectChanges();
  }

  private loadForm() {
    if (this.engagementProjet) {
      console.log('load form engagement', this.engagementProjet);
      this.projetForm = new FormGroup({
        id: new FormControl(this.engagementProjet.projetId, [Validators.required]),
        numero: new FormControl(this.engagementProjet.projetNumero, [Validators.required]),
        nom: new FormControl(this.engagementProjet.nom, [Validators.required]),
        partenaires: new FormControl<string[]>(
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
          cibleTous: new FormControl<boolean>(
            !!this.engagementProjet.cibles?.includes('Tous')
          ),
        }),
        engagementsPopu: new FormArray([]),
        annee: new FormControl(new Date().getFullYear(), [Validators.required]),
        exAntes: new FormArray([]),
        exPosts: new FormArray([]),
      });
      /*this.projetService.getAllIndicateurs().subscribe({
        next: (results) => {
          console.log('indicateurs results', results);
          results.forEach((indicateur) => {
            this.addIndicateur(indicateur);
          });
        },
        error: (error) => {
          console.error('error getAllIndicateurs', error);
          this.cdr.detectChanges();
        },
        complete: () => {
          this.cdr.detectChanges();
        },
      });*/
      this.loadEngagements();
      this.engagementProjet.actions.forEach((action) => {
        this.addActivite(action);
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

  protected saveProjet() {
    this.msg = '';
    const engagement: EngagementProjetDto = {
      projetId: this.projetForm.controls['id'].value,
      projetNumero: this.projetForm.controls['numero'].value,
      nom: this.projetForm.controls['nom'].value,
      partenaires: [...this.projetForm.controls['partenaires'].value],
      indicateurs: [...this.getSelectedIndicateurs()],
      resultatsAttendus: this.projetForm.controls['resultatsAttendus'].value,
      debutPrevu: this.projetForm.controls['debutPrevu'].value,
      debutEffectif: this.projetForm.controls['debutEffectif'].value,
      finPrevue: this.projetForm.controls['finPrevue'].value,
      finEffective: this.projetForm.controls['finEffective'].value,
      actions: [],
    };

    console.log('envoie enregistrement  ', engagement);
    this.engagementService.saveEngagementProjetDto(engagement).subscribe({
      next: (data) => {
        console.log('enregistrement ok données recu ', data);
        this.engagementProjet = data;
      },
      error: (err) => {
        this.msg = `Erreur d'enregistrement code : ${err.status}, msg=${err.message} `;
        this.cdr.detectChanges();
      },
      complete: () => {
        this.nextStep();
      },
    });
    console.log('engagement save', engagement);
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

  // Getter for form array
  get activites(): FormArray {
    return this.projetForm.get('activites') as FormArray;
  }

  // Add a new action field
  addActivite(action: Action): void {
    const formGroup = new FormGroup({
      nom: new FormControl(action.nom, Validators.required),
      porteur: new FormControl(action.porteur, Validators.required),
      partenaires: new FormControl<string[]>(action.partenaires, Validators.required),
      resultatsAttendus: new FormControl<string[]>(action.resultatsAttendus, Validators.required),
      debutPrevu: new FormControl(action.debutPrevu, [Validators.required]),
      debutEffectif: new FormControl(action.debutEffectif, [Validators.required]),
      finPrevue: new FormControl(action.finPrevue, [Validators.required]),
      finEffective: new FormControl(action.finEffective, [Validators.required]),
    });
    this.activites.push(formGroup);
  }

  get exAntes(): FormArray {
    return this.projetForm.get('exAntes') as FormArray;
  }

  exAntesAt(index: number): AvancementProjetDto {
    const avancementForm = this.exAntes.at(index) as FormGroup;
    return {
      projetId: this.projetForm.controls['id'].value,
      datation: avancementForm.controls['datation'].value,
      tauxType: avancementForm.controls['tauxType'].value,
      taux: avancementForm.controls['taux'].value,
    };
  }

  exPostsAt(index: number): AvancementProjetDto {
    const avancementForm = this.exPosts.at(index) as FormGroup;
    return {
      projetId: this.projetForm.controls['id'].value,
      datation: avancementForm.controls['datation'].value,
      tauxType: avancementForm.controls['tauxType'].value,
      taux: avancementForm.controls['taux'].value,
    };
  }

  get exPosts(): FormArray {
    return this.projetForm.get('exPosts') as FormArray;
  }

  editSelectedActivite() {
    this.editMode = true;
  }

  private hideEdit() {
    this.editMode = false;
  }

  newActivite() {
    const porteurName = this.engagementProjet?.porteur ? this.engagementProjet?.porteur : '';
    let porteur: Structure | undefined;
    if (porteurName) {
      porteur = this.partenairesDb.find((p) => p.nom === porteurName || p.code === porteurName);
    }
    this.selectedActiviteForm = new FormGroup({
      id: new FormControl(''),
      index: new FormControl(''),
      activite: new FormControl('', Validators.required),
      porteur: new FormControl<Structure>(
        porteur ?? { nom: '', code: '', rattachement: null },
        Validators.required,
      ),
      partenaires: new FormControl<string[]>([], Validators.required),
      resultatsAttendus: new FormControl<string[]>([], Validators.required),
      debutPrevu: new FormControl('', [Validators.required]),
      debutEffectif: new FormControl('', [Validators.required]),
      finPrevue: new FormControl('', [Validators.required]),
      finEffective: new FormControl('', [Validators.required]),
    });
    this.editMode = true;
  }

  protected saveActivite() {
    const activite: ActiviteDto = {
      projetId: this.projetForm.controls['id'].value,
      nom: this.selectedActiviteForm.controls['activite'].value,
      porteur: this.selectedActiviteForm.controls['porteur'].value,
      partenaires: this.selectedActiviteForm.controls['partenaires'].value,
      resultatsAttendus: this.selectedActiviteForm.controls['resultatsAttendus'].value,
      debutEffectif: this.selectedActiviteForm.controls['debutEffectif'].value,
      debutPrevu: this.selectedActiviteForm.controls['debutPrevu'].value,
      finPrevue: this.selectedActiviteForm.controls['finPrevue'].value,
      finEffective: this.selectedActiviteForm.controls['finEffective'].value,
    };
    console.log('activite save', activite);
    this.engagementService.createActivite(activite).subscribe({
      next: (data) => {
        this.engagementProjet = data;
      },
      complete: () => {
        this.loadForm();
        this.hideEdit();
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.log('error', err);
      },
    });
  }

  searchPartenaire(event: any) {
    const ori = event.query || '';
    const query = ori.toLowerCase();
    if (query) {
      this.filteredPartenaires = this.partenairesDb.filter(
        (p) => p.code.toLowerCase().includes(query) || p.nom.toLowerCase().includes(query),
      );
      let structure = this.partenairesDb.find(
        (p) => p.code.toLowerCase() === query || p.nom.toLowerCase() === query,
      );
      if (!structure) {
        this.filteredPartenaires.unshift({
          nom: ori.trim(),
          code: ori.trim(),
          rattachement: null,
        });
      }
    } else {
      this.filteredPartenaires = [...this.partenairesDb];
    }
  }

  loadPartenaireDb() {
    this.chargementPartenaires = true;
    this.engagementService.getAllPartenaires().subscribe({
      next: (data) => {
        this.partenairesDb = data;
      },
      error: (err) => {
        this.partenairesDb = [];
        this.chargementPartenaires = false;
      },
      complete: () => {
        this.chargementPartenaires = false;
      },
    });
  }

  getPartenaireLabel(structure: Structure): string {
    return structure.nom;
  }

  getPartenaireValue(structure: any): any {
    if (typeof structure === 'string') {
      return {
        nom: structure,
        code: structure,
        rattachement: null,
      };
    }
    return {
      id: structure.id,
      nom: structure.nom,
      code: structure.code,
      rattachement: structure.rattachement,
    };
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

  enregistrerAvancement() {
    const annee: number = this.projetForm.controls['annee'].value;
    const projetId: number = this.projetForm.controls['id'].value;
    const avancements: AvancementProjetDto[] = [];
    for (let i = 0; i < 4; i++) {
      avancements.push(this.exAntesAt(i));
      avancements.push(this.exPostsAt(i));
    }
    this.engagementService.saveAvancements(projetId, annee, avancements).subscribe({
      error: (err) => {
        console.log('erreur status ', err.status);
        this.msg = `Erreur code :${err.status}`;
      },
      complete: () => {
        //this.router.navigate(['/feuille-de-route']);
        this.nextStep();
      },
    });
  }

  protected updateEngagementYear() {
    console.log('updateEngagementYear');
    const year = this.projetForm.get('annee')?.value;
    this.exAntes.clear();
    this.exPosts.clear();
    if (this.projetId && year) {
      this.chargementsEngagementFromApi(this.projetId, year);
    }
  }

  protected rechargementsEngagementFromApi() {
    let year: number = this.projetForm.get('annee')?.value;
    let projetId = this.projetForm.get('id')?.value;
    if (year && projetId) {
      this.chargementsEngagementFromApi(projetId, year);
    }
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

        //this.router.navigate(['/feuille-de-route']);
        this.nextStep();
      },
    });
  }

  enregistrerFinances() {
    const projetId: number = this.projetForm.controls['id'].value;
    const financesForm=this.projetForm.get('finances') as FormGroup;
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

    const cibles:string[]=[];

    if (cibleUrbains){
      cibles.push('Urbains');
    }

    if (cibleRuraux){
      cibles.push('Ruraux');
    }

    if (cibleFaiblesRevenus){
      cibles.push('faibles revenus');
    }
    if (cibleHorsDakar){
      cibles.push('Hors Dakar');
    }

    if (cibleTous) {
      cibles.push('Tous');
    }

    const finances : ProjetFinanceDto={
      projetId: projetId,
      envTotale:envTotale,
      finePublic: finePublic,
      fineHorsBudget: fineHorsBudget,
      maturite: maturite,
      cibles:cibles
    }
    console.log('finances', finances);
    this.engagementService.saveFinances(finances).subscribe({
      error: (err) => {
        this.msg=`${err}`;
        this.cdr.detectChanges();
      },
      complete: () => {
        this.nextStep();
      }
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
}
