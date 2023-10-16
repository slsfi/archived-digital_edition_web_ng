import { Component, Inject, Input, LOCALE_ID, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { catchError, Observable, of, Subject } from 'rxjs';

import { MetadataService } from '@services/metadata.service';
import { ReadPopoverService } from '@services/read-popover.service';


@Component({
  standalone: true,
  selector: 'text-metadata',
  templateUrl: 'metadata.html',
  styleUrls: ['metadata.scss'],
  imports: [CommonModule, IonicModule]
})
export class MetadataComponent implements OnInit {
  @Input() textItemID: string = '';

  loadingError$: Subject<boolean> = new Subject<boolean>();
  metadata$: Observable<any>;

  constructor(
    private metadataService: MetadataService,
    public readPopoverService: ReadPopoverService,
    @Inject(LOCALE_ID) public activeLocale: string
  ) {}

  ngOnInit() {
    this.metadata$ = this.metadataService.getMetadata(
      this.textItemID.split('_')[1] || '0', this.activeLocale
    ).pipe(
      catchError((error) => {
        console.error('Error loading metadata', error);
        this.loadingError$.next(true);
        return of();
      })
    );
  }

}
