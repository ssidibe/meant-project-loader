import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormArray, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { EngagementProjetDto, Structure } from '../../domain.models';
import { ProjetFinanceDto } from '../../ui.models';
import { ActivatedRoute, Router } from '@angular/router';
import { EngagementService } from '../../services/engagement-service';
import { LoadingData } from '../loading-data/loading-data';

@Component({
  selector: 'app-financements-projet',
  imports: [ReactiveFormsModule, LoadingData],
  templateUrl: './financements-projet.html',
  styleUrl: './financements-projet.scss',
})
export class FinancementsProjet implements OnInit {
  loading = false;
  @Input()
  projetId: number | undefined;

  engagementProjet?: EngagementProjetDto;

  @Output()
  etapeEmitter: EventEmitter<number> = new EventEmitter<number>();
  msg: string = '';

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly engagementService: EngagementService,
    private readonly cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  maturites = ['Idée / intention', 'Études / préparation', 'Lancement', 'Avancé', 'Opérationnel'];
  financeForm = new FormGroup<any>({
    envTotale: new FormControl(),
    finePublic: new FormControl(),
    fineHorsBudget: new FormControl(),
    maturite: new FormControl(),
    cibleUrbains: new FormControl(),
    cibleRuraux: new FormControl(),
    cibleFaiblesRevenus: new FormControl(),
    cibleHorsDakar: new FormControl(),
    cibleTous: new FormControl(),
  });

  protected cibleTousChanged(event: Event) {
    const cibleTousForm = this.financeForm.get('cibleTous');
    const cibleUrbainsForm = this.financeForm.get('cibleUrbains');
    const cibleRurauxForm = this.financeForm.get('cibleRuraux');
    const cibleFaiblesRevenusForm = this.financeForm.get('cibleFaiblesRevenus');
    const cibleHorsDakarForm = this.financeForm.get('cibleHorsDakar');
    const cibleVal: boolean = !!cibleTousForm?.value;

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

  enregistrerFinances(projetId: number) {
    const envTotale = this.financeForm.controls['envTotale'].value;
    const finePublic = this.financeForm.controls['finePublic'].value;
    const fineHorsBudget = this.financeForm.controls['fineHorsBudget'].value;
    const maturite = this.financeForm.controls['maturite'].value;
    const cibleUrbains = this.financeForm.controls['cibleUrbains'].value;
    const cibleRuraux = this.financeForm.controls['cibleRuraux'].value;
    const cibleFaiblesRevenus = this.financeForm.controls['cibleFaiblesRevenus'].value;
    const cibleHorsDakar = this.financeForm.controls['cibleHorsDakar'].value;
    const cibleTous = this.financeForm.controls['cibleTous'].value;

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
          this.etapeEmitter.emit(1);
        }
      },
    });
  }

  protected previousStep(): void {
    this.etapeEmitter.emit(-1);
  }

  private loadForm(engagementProjet: EngagementProjetDto) {
    this.financeForm = new FormGroup({
      envTotale: new FormControl(engagementProjet.enveloppe),
      finePublic: new FormControl(engagementProjet.financementPublic),
      fineHorsBudget: new FormControl(engagementProjet.financementHorsBudget),
      maturite: new FormControl(engagementProjet.maturite),
      cibleUrbains: new FormControl<boolean>(!!engagementProjet.cibles?.includes('Urbains')),
      cibleRuraux: new FormControl<boolean>(!!engagementProjet.cibles?.includes('Ruraux')),
      cibleFaiblesRevenus: new FormControl<boolean>(
        !!engagementProjet.cibles?.includes('faibles revenus'),
      ),
      cibleHorsDakar: new FormControl<boolean>(!!engagementProjet.cibles?.includes('Hors Dakar')),
      cibleTous: new FormControl<boolean>(!!engagementProjet.cibles?.includes('Tous')),
    });
  }

  private loadData() {
    if (this.projetId) {
      this.setLoading(true);
      this.engagementService.getEngagementByProjetId(this.projetId).subscribe({
        next: (engagementProjet: EngagementProjetDto) => {
          console.log('donnees reçu', engagementProjet);
          this.engagementProjet = engagementProjet;
          this.loadForm(engagementProjet);
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
        },
      });
    }
  }

  private setLoading(loading: boolean) {
    this.loading = loading;
    this.cdr.detectChanges();
  }
}
