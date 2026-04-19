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
import { ActiviteDto, AvancementProjetAnnuel, AvancementProjetDto } from '../ui.models';
import { Step, StepList, StepPanel, StepPanels, Stepper } from 'primeng/stepper';
import { InputText } from 'primeng/inputtext';
import { Select } from 'primeng/select';
import { InputMaskDirective } from 'primeng/inputmask';
import { ProjetService } from '../services/projet-service';


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
  etape: number = 1;
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
    indicateurs: new FormArray([]),
    debutEffectif: new FormControl('', [Validators.required]),
    finEffective: new FormControl('', [Validators.required]),
    debutPrevu: new FormControl('', [Validators.required]),
    finPrevue: new FormControl(new Date(), [Validators.required]),
    activites: new FormArray([]),
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
        indicateurs: new FormArray([]),
        annee: new FormControl(new Date().getFullYear(), [Validators.required]),
        exAntes: new FormArray([]),
        exPosts: new FormArray([]),
      });
      this.projetService.getAllIndicateurs().subscribe({
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
      });
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

  addIndicateur(indicateur: Indicateur) {
    const nom = indicateur.nom;
    const formGroup = new FormGroup({
      nom: new FormControl(indicateur.nom, Validators.required),
      selected: new FormControl(this.engagementProjet?.indicateurs.includes(nom)),
    });
    this.indicateurs.push(formGroup);
  }

  get indicateurs(): FormArray {
    return this.projetForm.get('indicateurs') as FormArray;
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
        this.router.navigate(['/feuille-de-route']);

      },
    });
  }

  private getSelectedIndicateurs():string[] {
    const res: string[] = [];
    for (let i = 0; i < this.indicateurs.length; i++) {
      const formGroup = this.indicateurs.at(i) as FormGroup;
      const selected: boolean = formGroup.get('selected')?.value;
      if (selected) {
        res.push(formGroup.controls['nom']?.value);
      }
    }
    return res;
  }
}
