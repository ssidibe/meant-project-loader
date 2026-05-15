import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { EngagementService } from '../../services/engagement-service';
import { ProjetService } from '../../services/projet-service';
import { EngagementProjetDto } from '../../domain.models';

@Component({
  selector: 'app-recap-indic-pilote',
  imports: [ReactiveFormsModule],
  templateUrl: './recap-indic-pilote.html',
  styleUrl: './recap-indic-pilote.scss',
})
export class RecapIndicPilote implements OnInit {
  @Input()
  projetId: number | undefined;
  projet: EngagementProjetDto | undefined;
  errMsg = '';
  projetForm = new FormGroup({
    id: new FormControl(0),
    nom: new FormControl(''),
    epList: new FormArray<any>([]),
  });

  constructor(
    private readonly cdr: ChangeDetectorRef,
    private readonly engagementService: EngagementService,
    private readonly projetService: ProjetService,
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  private loadData() {
    if (this.projetId) {
      this.engagementService.getEngagementByProjetId(this.projetId).subscribe({
        next: (data) => {
          this.projet = data;
          const epArray = new FormArray<any>([]);
          this.projetForm = new FormGroup({
            id: new FormControl(this.projet.projetId),
            nom: new FormControl(this.projet.nom),
            epList: epArray,
          });
          this.cdr.detectChanges();
          this.engagementService.getEngagesPopu().subscribe({
            next: (epList) => {
              epList.forEach((ep) => {
                const domainesArray = new FormArray<any>([]);
                const epForm = new FormGroup({
                  nom: new FormControl(ep.nom),
                  domaines: domainesArray,
                  selected: new FormControl(false),
                });
                epArray.push(epForm);
                this.cdr.detectChanges();
                this.engagementService.getDomainesPrioritaires(ep).subscribe({
                  next: (dpList) => {
                    dpList.forEach((dp) => {
                      const focusArray = new FormArray<any>([]);
                      const dpForm = new FormGroup({
                        nom: new FormControl(dp.nom),
                        focusList: focusArray,
                        selected: new FormControl(false),
                      });
                      domainesArray.push(dpForm);
                      this.cdr.detectChanges();
                      this.engagementService.getFocusList(dp).subscribe({
                        next: (focusList) => {
                          focusList.forEach((focus) => {
                            const indicsArrays = new FormArray<any>([]);
                            const focusForm = new FormGroup({
                              nom: new FormControl(focus.nom),
                              indicateurs: indicsArrays,
                              selected: new FormControl<boolean>(false),
                            });
                            focusArray.push(focusForm);
                            this.cdr.detectChanges();
                            this.engagementService.getIndicateursByFocus(focus).subscribe({
                              next: (indicateurs) => {
                                indicateurs.forEach((indicateur) => {
                                  if(this.projet && this.projet.indicateurs.includes(indicateur.nom)){
                                    const indicForm = new FormGroup({
                                      nom: new FormControl(indicateur.nom),
                                    });
                                    indicsArrays.push(indicForm);
                                    focusForm.get('selected')?.setValue(true);
                                    dpForm.get('selected')?.setValue(true);
                                    epForm.get('selected')?.setValue(true);
                                    this.cdr.detectChanges();
                                  }
                                });
                              }
                            });
                          });
                        },
                      });
                    });
                  },
                });
              });
            },
          });
        },
        complete: () => {
          console.log('Engagement finished successfully.');
        },
      });
    }
  }

  private loadData1() {
    this.errMsg = '';
    if (this.projet) {
      const epArray = new FormArray<any>([]);
      this.projetForm = new FormGroup({
        id: new FormControl(this.projet.projetId),
        nom: new FormControl(this.projet.nom),
        epList: epArray,
      });
      this.cdr.detectChanges();
      this.engagementService.getEngagesPopu().subscribe({
        next: (epList) => {
          epList.forEach((eP) => {
            const domainesArray = new FormArray<any>([]);
            const epForm = new FormGroup({
              nom: new FormControl(eP.nom),
              domaines: domainesArray,
              selected: new FormControl(false),
            });
            epArray.push(epForm);
            this.cdr.detectChanges();
            this.engagementService.getDomainesPrioritaires(eP).subscribe({
              next: (dpList) => {
                dpList.forEach((dp) => {
                  const focusArray = new FormArray<any>([]);
                  const dpForm = new FormGroup({
                    nom: new FormControl(dp.nom),
                    focusList: focusArray,
                    selected: new FormControl(false),
                  });
                  domainesArray.push(dpForm);
                  this.engagementService.getFocusList(eP).subscribe({
                    next: (focusList) => {
                      focusList.forEach((focus) => {
                        const indicsArrays = new FormArray<any>([]);
                        const focusForm = new FormGroup({
                          nom: new FormControl(focus.nom),
                          indicateurs: indicsArrays,
                          selected: new FormControl<boolean>(false),
                        });
                        focusArray.push(focusForm);

                        this.engagementService.getIndicateursByFocus(focus).subscribe({
                          next: (indics) => {
                            indics.forEach((indic) => {
                              if (this.projet && this.projet.indicateurs.includes(indic.nom)) {
                                console.log('### selected', indic.nom);
                                const indicForm = new FormGroup({
                                  nom: new FormControl(indic.nom),
                                });
                                indicsArrays.push(indicForm);
                                focusForm.get('selected')?.setValue(true);
                                dpForm.get('selected')?.setValue(true);
                                epForm.get('selected')?.setValue(true);
                              } else {
                                console.log('### introuvable', indic.nom);
                              }
                            });
                          },
                        });
                      });
                    },
                  });
                });
              },
            });
          });
        },
        error: (e) => {},
      });
    }
  }

  get engPopuList(): FormArray {
    return this.projetForm.get('epList') as FormArray;
  }

  protected getDomains(epI: number): FormArray {
    return this.engPopuList.at(epI).get('domaines') as FormArray;
  }

  protected getFocusArray(epI: number, dpIndex: number): FormArray {
    return this.getDomains(epI).at(dpIndex).get('focusList') as FormArray;
  }

  protected getIndicArray(epI: number, dpIndex: number, focIdx: number):FormArray {
    return this.getFocusArray(epI, dpIndex).at(focIdx).get('indicateurs') as FormArray;
  }
}
