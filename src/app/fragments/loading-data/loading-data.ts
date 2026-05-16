import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-loading-data',
  imports: [],
  templateUrl: './loading-data.html',
  styleUrl: './loading-data.scss',
})
export class LoadingData {
  @Input()
  iconSize: string = '2rem';

  @Input()
  loadingClass: string = 'text-danger';

  @Input()
  loadingText: string = 'chargement en cours ...';
}
