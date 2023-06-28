import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';


export enum Fontsize {
    xsmall = 0,
    small,
    medium,
    large,
    xlarge
}

@Injectable({
  providedIn: 'root',
})
export class ReadPopoverService {
  show = {
    'comments': true,
    'personInfo': false,
    'abbreviations': false,
    'placeInfo': false,
    'workInfo': false,
    'changes': false,
    'normalisations': false,
    'paragraphNumbering': false,
    'pageBreakOriginal': false,
    'pageBreakEdition': false
  };
  fontsize = Fontsize.small;
  private fontsizeSubject: BehaviorSubject<Fontsize> = new BehaviorSubject<Fontsize>(this.fontsize);
  fontsize$: Observable<Fontsize> = this.fontsizeSubject.asObservable();

  constructor() {}

  sendFontsizeToSubscribers(fontsize: Fontsize) {
    this.fontsizeSubject.next(fontsize);
  }

}
