import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

import { Textsize } from '@models/textsize.model';


@Injectable({
  providedIn: 'root',
})
export class ViewOptionsService {
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

  private textsizeSubject: BehaviorSubject<Textsize> = new BehaviorSubject<Textsize>(Textsize.small);

  constructor() {}

  getTextsize(): Observable<Textsize> {
    return this.textsizeSubject.asObservable();
  }

  setTextsize(textsize: Textsize) {
    this.textsizeSubject.next(textsize);
  }

}
