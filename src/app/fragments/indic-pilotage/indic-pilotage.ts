import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormArray, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { EngagementService } from '../../services/engagement-service';
import { DomainePrioDto, EngagePopuDto, FocusDto } from '../../ui.models';
import { EngagementProjetDto } from '../../domain.models';
import { LoadingData } from '../loading-data/loading-data';

@Component({
  selector: 'app-indic-pilotage',
  imports: [ReactiveFormsModule, LoadingData],
  templateUrl: './indic-pilotage.html',
  styleUrl: './indic-pilotage.scss',
})
export class IndicPilotage implements OnInit {
  loading = false;
  @Input()
  projetId: number | undefined;

  engagementProjet?: EngagementProjetDto;

  @Output()
  etapeEmitter: EventEmitter<number> = new EventEmitter<number>();
  projetForm = new FormGroup({
    engagementsPopu: new FormArray([]),
  });
  private msg: string = '';

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly engagementService: EngagementService,
    private readonly cdr: ChangeDetectorRef,
  ) {}
  ngOnInit(): void {
    this.loadProjet();
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

  enregistrerIndicateurs() {
    if (this.projetId) {
      const res: string[] = this.getSelectedIndicateurs();
      console.log('selection', res);

      this.engagementService.saveIndicateurs(this.projetId, res).subscribe({
        error: (err) => {
          console.log('erreur status ', err.status);
          this.msg = `Erreur code :${err.status}`;
        },
        complete: () => {
          console.log('enregistremnt ok');

          //this.router.navigate(['/feuille-de-route']);
          this.etapeEmitter.emit(1);
        },
      });
    }
  }

  private loadProjet() {
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
          console.log('chargement ok projet');
          this.loadEngagements();
        },
      });
    }
  }

  loadEngagements() {
    this.loading = true;
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
        this.setLoading(false);
      },
    });
  }

  protected previousStep(): void {
    this.etapeEmitter.emit(-1);
  }

  private setLoading(loading: boolean) {
    this.loading = loading;
    this.cdr.detectChanges();
  }
}
