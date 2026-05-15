import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AutoComplete } from 'primeng/autocomplete';
import { DatePicker } from 'primeng/datepicker';
import {
  FormArray,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { EngagementProjetDto, Structure } from '../../domain.models';
import { UtilService } from '../../services/util-service';
import { EngagementService } from '../../services/engagement-service';
import { JalonProjetDto } from '../../ui.models';



@Component({
  selector: 'app-jalons-projet',
  imports: [AutoComplete, DatePicker, FormsModule, ReactiveFormsModule],
  templateUrl: './jalons-projet.html',
  styleUrl: './jalons-projet.scss',
})
export class JalonsProjet implements OnInit {
  @Input()
  projetId: number | undefined;

  @Output()
  etapeEmitter = new EventEmitter<number>();

  filteredPartenaires: Structure[] = [];
  protected loading: boolean = false;

  partenairesDb: Structure[] = [];
  protected msg: string = '';

  projetForm: FormGroup = new FormGroup({
    partenaires: new FormControl<Structure[]>([], Validators.required),
    resultatsAttendus: new FormControl<string[]>([], Validators.required),
    debutEffectif: new FormControl('', [Validators.required]),
    finEffective: new FormControl('', [Validators.required]),
    debutPrevu: new FormControl('', [Validators.required]),
    finPrevue: new FormControl('', [Validators.required]),
  });
  protected engagementProjet: EngagementProjetDto | undefined;

  constructor(
    protected utilService: UtilService,
    protected engagementService: EngagementService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
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
          this.setLoading(false);
          this.loadPartenaireDb();
        },
      });
    }
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
    this.setLoading(true);
    this.engagementService.getAllPartenaires().subscribe({
      next: (data) => {
        this.partenairesDb = data;
      },
      error: (err) => {
        this.partenairesDb = [];
        this.setLoading(false);
      },
      complete: () => {
        if (this.engagementProjet) {
          this.projetForm = new FormGroup({
            partenaires: new FormControl<Structure[]>(
              this.engagementProjet.partenaires,
              Validators.required,
            ),
            resultatsAttendus: new FormControl<string[]>(
              this.engagementProjet.resultatsAttendus,
              Validators.required,
            ),
            debutEffectif: new FormControl(this.engagementProjet.debutEffectif),
            finEffective: new FormControl(this.engagementProjet.finEffective),
            debutPrevu: new FormControl(this.engagementProjet.debutPrevu),
            finPrevue: new FormControl(this.engagementProjet.finPrevue),
          });
        }
        this.setLoading(false);
      },
    });
  }

  protected saveJalonProjet() {
    if (this.projetId) {
      this.msg = '';
      const jalonDto: JalonProjetDto = {
        projetId: this.projetId,
        partenaires: [...this.projetForm.controls['partenaires'].value],
        resultatsAttendus: this.projetForm.controls['resultatsAttendus'].value,
        debutPrevu: this.projetForm.controls['debutPrevu'].value,
        debutEffectif: this.projetForm.controls['debutEffectif'].value,
        finPrevue: this.projetForm.controls['finPrevue'].value,
        finEffective: this.projetForm.controls['finEffective'].value,
      };

      console.log('envoie enregistrement  ', jalonDto);
      this.engagementService.saveJalonProjet(jalonDto).subscribe({
        error: (err) => {
          this.msg = `Erreur d'enregistrement code : ${err.status}, msg=${err.message} `;
          this.cdr.detectChanges();
        },
        complete: () => {
          //this.nextStep();
          console.log('enregistrement ok ', jalonDto);
          this.etapeEmitter.emit(1)
        },
      });
    }
  }

  private setLoading(loading: boolean) {
    this.loading = loading;
    this.cdr.detectChanges();
  }
}
