import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Action, EngagementProjetDto, Structure } from '../../domain.models';
import {
  FormArray,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { TableModule } from 'primeng/table';
import { AutoComplete } from 'primeng/autocomplete';
import { DatePicker } from 'primeng/datepicker';
import { Dialog } from 'primeng/dialog';
import { FloatLabel } from 'primeng/floatlabel';
import { Textarea } from 'primeng/textarea';
import { UtilService } from '../../services/util-service';
import { EngagementService } from '../../services/engagement-service';
import { JsonPipe } from '@angular/common';
import { ActiviteDto } from '../../ui.models';

@Component({
  selector: 'app-activites-projet',
  imports: [
    FormsModule,
    ReactiveFormsModule,
    TableModule,
    AutoComplete,
    DatePicker,
    Dialog,
    FloatLabel,
    Textarea,
  ],
  templateUrl: './activites-projet.html',
  styleUrl: './activites-projet.scss',
})
export class ActivitesProjet implements OnInit {
  @Input()
  projetId: number | undefined;

  @Output()
  etapeEmitter: EventEmitter<number> = new EventEmitter<number>();

  protected loading: boolean = false;
  partenairesDb: Structure[] = [];

  projetForm = this.initProjeForm();

  engagementProjet?: EngagementProjetDto;

  // Getter for form array
  selectedActiviteForm = new FormGroup({
    id: new FormControl(''),
    index: new FormControl(''),
    activite: new FormControl('', Validators.required),
    porteur: new FormControl<Structure>({ nom: '', code: '', rattachement: null }),
    partenaires: new FormControl<Structure[]>([]),
    resultatsAttendus: new FormControl<string[]>([]),
    debutPrevu: new FormControl(''),
    debutEffectif: new FormControl(''),
    finPrevue: new FormControl(''),
    finEffective: new FormControl(''),
  });
  editMode: boolean = false;

  filteredPartenaires: Structure[] = [];
  protected msg: string = '';

  constructor(
    protected readonly utilService: UtilService,
    private engagementService: EngagementService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    console.log('on init ActivitesProjet');
    this.loadData();
  }

  get activites(): FormArray {
    return this.projetForm.get('activites') as FormArray;
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
      porteur: new FormControl<Structure>(porteur ?? { nom: '', code: '', rattachement: null }),
      partenaires: new FormControl<Structure[]>([]),
      resultatsAttendus: new FormControl<string[]>([]),
      debutPrevu: new FormControl(''),
      debutEffectif: new FormControl(''),
      finPrevue: new FormControl(''),
      finEffective: new FormControl(''),
    });
    this.editMode = true;
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

  protected previous() {
    this.etapeEmitter.emit(-1);
  }

  protected save() {
    this.etapeEmitter.emit(1);
  }

  private loadData() {
    if (this.projetId) {
      this.setLoading(true);
      this.engagementService.getEngagementByProjetId(this.projetId).subscribe({
        next: (engagementProjet: EngagementProjetDto) => {
          console.log('donnees reçu', engagementProjet);
          this.engagementProjet = engagementProjet;
        },
        error: (error) => {
          console.error('error', error);
          const status = error.status;
          if (status === 454) {
            this.msg = `Engagement du projet id=${this.projetId} introuvable`;
          } else {
            console.error(`Erreur code : ${status}, ${error}`);
            this.msg = `Erreur code : ${status}`;
          }
          this.setLoading(false);
        },
        complete: () => {
          console.log('done');
          this.engagementProjet?.actions.forEach((action) => {
            this.addActivite(action);
          })

          this.setLoading(false);
          this.loadPartenaireDb();
        },
      });
    }
  }

  private setLoading(loading: boolean) {
    this.loading = loading;
    this.cdr.detectChanges();
  }

  loadPartenaireDb() {
    console.log('loadPartenaireDb');
    this.setLoading(true);
    this.engagementService.getAllPartenaires().subscribe({
      next: (data) => {
        console.log('data', data);
        this.partenairesDb = data;
      },
      error: (err) => {
        this.partenairesDb = [];
        this.setLoading(false);
      },
      complete: () => {
        this.setLoading(false);
      },
    });
  }

  protected saveActivite() {
    const nomActivite = this.selectedActiviteForm.controls['activite'].value;
    if (this.projetId && nomActivite) {
      const activite: ActiviteDto = {
        projetId: this.projetId,
        nom: nomActivite,
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
          this.projetForm=this.initProjeForm();
          this.engagementProjet.actions.forEach((action) => {
            this.addActivite(action);
          })
        },
        complete: () => {
          this.hideEdit();
        },
        error: (err) => {
          console.log('error', err);
        },
      });
    }
  }
  private hideEdit() {
    this.editMode = false;
    this.cdr.detectChanges();
  }

  private initProjeForm(){
    return new FormGroup({
      activites: new FormArray([]),
    })
  }
}
