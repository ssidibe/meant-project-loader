import { Component, Input } from '@angular/core';
import { Tooltip } from 'primeng/tooltip';

@Component({
  selector: 'app-ex-ante-post-details',
  imports: [Tooltip],
  templateUrl: './ex-ante-post-details.html',
  styleUrl: './ex-ante-post-details.scss',
})
export class ExAntePostDetails {
  @Input()
  exAnteVal: number | undefined;
  @Input()
  exAnteComm: string | undefined;

  @Input()
  exPostVal: number | undefined;

  @Input()
  exPostComm: string | undefined;

  protected getValue(exAntePost: number): string {
    return exAntePost >= 0 && exAntePost < 10 ? `0${exAntePost}%` : `${exAntePost}%`;
  }
}
