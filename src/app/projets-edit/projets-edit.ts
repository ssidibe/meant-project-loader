import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { InputText } from 'primeng/inputtext';
import { Select } from 'primeng/select';
import { Textarea } from 'primeng/textarea';
import { ProjetDto } from '../domain.models';
import { ActivatedRoute } from '@angular/router';
import { ProjetService } from '../services/projet-service';

@Component({
  selector: 'app-projets-edit',
  imports: [FormsModule, InputText, ReactiveFormsModule, Select, Textarea],
  templateUrl: './projets-edit.html',
  styleUrl: './projets-edit.scss',
})
export class ProjetsEdit implements OnInit {
  numero: string | null = null;
  projet: ProjetDto | undefined;
  champsActif = '';
  txtAreaRow = 3;
  fineType = ['public', 'privé', 'public-privé'];
  form = new FormGroup({
    desc: new FormControl('', [Validators.maxLength(1000)]),
    obj: new FormControl('', [Validators.maxLength(1000)]),
    results: new FormControl('', [Validators.maxLength(1000)]),
    zone: new FormControl('', [Validators.maxLength(1000)]),
    typeFin: new FormControl(''),
    finPub: new FormControl('', [Validators.maxLength(1000)]),
    finPriv: new FormControl('', [Validators.maxLength(1000)]),
    pPrenante: new FormControl('', [Validators.maxLength(1000)]),
  });

  errMsg = '';
  constructor(
    private readonly route: ActivatedRoute,
    private readonly projetService: ProjetService,
    private readonly cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      this.numero = params.get('numero');
      console.log('ID via observable:', this.numero);
      this.chargerDonnees(this.numero);
    });
  }

  private chargerDonnees(id: string | null) {
    this.errMsg = '';
    this.projetService.getDetails(id).subscribe({
      next: (data) => {
        this.projet = data;
        this.cdr.detectChanges();
        console.log('projet', this.projet);
      },
      error: (err) => {
        this.projet = undefined;
        console.log('ereur erreur:', err);
      },
    });
  }
}
