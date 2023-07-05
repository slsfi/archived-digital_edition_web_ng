import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { IonicModule, ModalController } from '@ionic/angular';
import { catchError, defaultIfEmpty, filter, forkJoin, map, Observable, of, Subject, Subscription, timeout } from 'rxjs';

import { ComponentsModule } from 'src/app/components/components.module';
import { OccurrencesAccordionComponent } from 'src/app/components/occurrences-accordion/occurrences-accordion.component';
import { CommonFunctionsService } from 'src/app/services/common-functions.service';
import { OccurrenceService } from 'src/app/services/occurence.service';
import { SemanticDataService } from 'src/app/services/semantic-data.service';
import { TooltipService } from 'src/app/services/tooltip.service';
import { config } from "src/assets/config/config";


@Component({
  standalone: true,
  selector: 'modal-semantic-data-object',
  templateUrl: 'semantic-data-object.modal.html',
  styleUrls: ['semantic-data-object.modal.scss'],
  imports: [CommonModule, ComponentsModule, IonicModule, OccurrencesAccordionComponent, RouterModule]
})
export class SemanticDataObjectModal implements OnInit {
  @Input() id: string = '';
  @Input() type: string = '';

  hideTypeAndDescription = false;
  hideCityRegionCountry = false;
  loadingErrorData$: Subject<boolean> = new Subject<boolean>();
  objectData$: Observable<any>;
  routerEventsSubscription: Subscription;
  showOccurrences: boolean = true;
  simpleWorkMetadata: boolean = false;

  constructor(
    private semanticDataService: SemanticDataService,
    private modalCtrl: ModalController,
    private tooltipService: TooltipService,
    private occurrenceService: OccurrenceService,
    private commonFunctions: CommonFunctionsService,
    public router: Router
  ) {
    this.simpleWorkMetadata = config.useSimpleWorkMetadata ?? false;
    this.hideTypeAndDescription = config.component?.occurrencesAccordion?.hideTypeAndDescription ?? false;
    this.hideCityRegionCountry = config.component?.occurrencesAccordion?.hideCityRegionCountry ?? false;
    this.showOccurrences = config.modal?.semanticDataObject?.showOccurrences ?? true;
  }

  ngOnInit() {
    this.objectData$ = this.getSemanticDataObjectData(this.type, this.id);

    // Close the modal on route change
    this.routerEventsSubscription = this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.modalCtrl.getTop().then((modal) => {
        modal?.dismiss();
      });
    });
  }

  ionViewWillLeave() {
    this.routerEventsSubscription?.unsubscribe();
  }

  private getSemanticDataObjectData(type: string, id: string): Observable<any> {
    return forkJoin(
      [
        this.getSemanticDataObjectDetails(type, id),
        this.getSemanticDataObjectMediaData(type, id),
        this.getSemanticDataObjectArticleData(type, id),
        this.getSemanticDataObjectGalleryOccurrences(type, id)
      ]
    ).pipe(
      map((res: any[]) => {
        let emptyData = true;
        for (let i = 0; i < res.length; i++) {
          if (
            (
              Array.isArray(res[i]) && res[i].length
            ) ||
            (
              typeof res[i] === 'object' && res[i] !== null && !this.commonFunctions.isEmptyObject(res[i])
            )
          ) {
            emptyData = false;
          }
        }

        if (emptyData) {
          this.loadingErrorData$.next(true);
          defaultIfEmpty(null);
        } else {
          const data: any = {
            details: res[0],
            media: res[1],
            articles: res[2],
            galleryOccurrences: res[3],
          };

          return data;
        }
      }),
      catchError((error: any) => {
        console.error('Error loading object data', error);
        this.loadingErrorData$.next(true);
        return of(undefined);
      })
    );
  }

  private getSemanticDataObjectDetails(type: string, id: string): Observable<any> {
    if (type !== 'work' || (type === 'work' && this.simpleWorkMetadata)) {
      // Get semantic data object details from the backend API
      return this.semanticDataService.getSingleSemanticDataObject(type, id).pipe(
        timeout(20000),
        map((data: any) => {
          if (type === 'work') {
            data.description = null;
            data.source = null;
          }

          !data.title && data.full_name ? data.title = data.full_name
            : !data.title && data.name ? data.title = data.name
            : data.title;

          data.year_born_deceased = this.tooltipService.constructYearBornDeceasedString(
            data.date_born, data.date_deceased
          );
          // console.log('data object details: ', data);
          return data;
        }),
        catchError((error: any) => {
          return of({});
        })
      );
    } else {
      // For work manifestations, get semantic data object details from Elasticsearch API
      return this.semanticDataService.getSingleObjectElastic(type, id).pipe(
        timeout(20000),
        map((data: any) => {
          if (data?.hits?.hits?.length < 1) {
            return of({});
          }

          data = data.hits.hits[0]['_source'];
          data.id = data['man_id' as keyof typeof data];
          data.description = data['reference' as keyof typeof data];
          if (
            !data.author_data ||
            !data.author_data[0] ||
            !data.author_data[0]['id']
          ) {
            data.author_data = [];
          }
          // console.log('work details: ', data);
          return data;
        }),
        catchError((error: any) => {
          return of({});
        })
      );
    }
  }

  private getSemanticDataObjectMediaData(type: string, id: string): Observable<any> {
    return this.occurrenceService.getMediaData(type, id).pipe(
      timeout(20000),
      map((data: any) => {
        data.imageUrl = data.image_path;
        return data;
      }),
      catchError((error: any) => {
        return of({});
      })
    );
  }

  private getSemanticDataObjectArticleData(type: string, id: string): Observable<any> {
    return this.occurrenceService.getArticleData(type, id).pipe(
      timeout(20000),
      catchError((error: any) => {
        return of({});
      })
    );
  }

  private getSemanticDataObjectGalleryOccurrences(type: string, id: string): Observable<any> {
    return this.occurrenceService.getGalleryOccurrences(type, id).pipe(
      timeout(20000),
      catchError((error: any) => {
        return of({});
      })
    );
  }

  openGallery(data: any) {
    let type = this.type;
    if (type === 'places') {
      type = 'location';
    } else if (type === 'tags' || type === 'keyword') {
      type = 'tag';
    } else if (type === 'subjects' || type === 'person')  {
      type = 'subject';
    }

    this.router.navigate([`/media-collection/${null}/${data.id}/${type}`]);
  }

  cancel() {
    this.modalCtrl.dismiss();
  }

}
