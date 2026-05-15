import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  inject,
  Input,
  OnDestroy,
  Output,
} from '@angular/core';
import { ProjetDto } from '../ui.models';
import { FileSelectEvent, FileUpload } from 'primeng/fileupload';
import { Button } from 'primeng/button';
import { ProgressBar, ProgressBarModule } from 'primeng/progressbar';
import { ProjetService } from '../services/projet-service';
import { EngagementService } from '../services/engagement-service';
import { Badge } from 'primeng/badge';
import { DatePipe, JsonPipe, NgOptimizedImage } from '@angular/common';
import { HttpEventType } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-projet-fiche-row',
  standalone: true,
  imports: [FileUpload, Button, ProgressBarModule, Badge, JsonPipe, NgOptimizedImage, DatePipe],
  templateUrl: './projet-fiche-row.html',
  styleUrl: './projet-fiche-row.scss',
})
export class ProjetFicheRow {
  @Input()
  projet: ProjetDto | undefined;

  @Input()
  odd?: boolean;

  @Input()
  even?: boolean;

  @Input()
  selected?: boolean = false;

  @Input()
  uploadUrl?: string;

  ficheProjet?: File;

  progression: number = 0;

  ficheFileUrlBase = `${environment.API.BASE_URL}/${environment.API.SERVICES.ENGAGEMENTS}/projets/fiches`;

  @Output() selectionChange = new EventEmitter<any>(); // ou un type spécifique

  constructor(
    private readonly engagementService: EngagementService,
    private readonly cdr: ChangeDetectorRef,
  ) {}

  // Méthode appelée quand la ligne est sélectionnée (ex. clic)
  onSelectProjet() {
    this.selectionChange.emit(this.projet);
  }

  protected onSelectedFile(event: FileSelectEvent) {
    this.ficheProjet = event.currentFiles[0];
    console.log('fichier', this.ficheProjet);
  }

  protected effacer(clearCallback: Function) {
    this.ficheProjet = undefined;
    clearCallback();
  }

  formatSize(bytes: number): string {
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];

    if (bytes === 0) return '0 B';

    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return (bytes / Math.pow(k, i)).toFixed(2) + ' ' + sizes[i];
  }

  protected uploadFile(clearCallback: Function) {
    console.log('upload url', this.projet?.id);
    this.setProgressBar(0);
    if (this.projet && this.ficheProjet) {
      this.engagementService.uploadFicheProjet(this.projet.id, this.ficheProjet).subscribe({
        next: (event) => {
          if (event.type === HttpEventType.UploadProgress && event.total) {
            this.setProgressBar(Math.round((100 * event.loaded) / event.total));
          } else if (event.type === HttpEventType.Response) {
            const fichierDto = event.body;
            if (this.projet && fichierDto) {
              this.projet.fichier = event.body;
              this.ficheProjet = undefined;
              clearCallback();
              console.log('fichier ', this.projet.fichier);
              this.cdr.detectChanges();
            }
          }
        },
        error: (error) => {
          console.log(error);
          this.cdr.detectChanges();
        },
        complete: () => {
          console.log('upload complete');
          this.setProgressBar(101);
        },
      });
    }
  }

  private setProgressBar(progress: number) {
    if (progress > 0) {
      this.progression = progress - 1;
    } else {
      this.progression = 0;
    }
    console.log(`Upload progress: ${this.progression}%`);
    this.cdr.detectChanges();
  }

  protected getProjetFicheFile() {
    if(this.projet && this.projet.fichier) {
      return `${this.ficheFileUrlBase}/${this.projet.fichier.id}`;
    }
    return "-1";
  }
}
