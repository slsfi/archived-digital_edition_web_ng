import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';

import { CollectionPagePathPipe } from 'src/pipes/collection-page-path.pipe';
import { OccurrenceCollectionTextPageQueryparamsPipe } from 'src/pipes/occurrence-collection-text-page-queryparams.pipe';
import { Occurrence } from 'src/app/models/occurrence.model';
import { SingleOccurrence } from 'src/app/models/single-occurrence.model';
import { CommonFunctionsService } from 'src/app/services/common-functions.service';
import { SemanticDataService } from 'src/app/services/semantic-data.service';
import { TableOfContentsService } from 'src/app/services/table-of-contents.service';
import { config } from 'src/assets/config/config';


@Component({
  standalone: true,
  selector: 'occurrences-accordion',
  templateUrl: 'occurrences-accordion.component.html',
  styleUrls: ['occurrences-accordion.component.scss'],
  imports: [
    CommonModule,
    IonicModule,
    RouterModule,
    CollectionPagePathPipe,
    OccurrenceCollectionTextPageQueryparamsPipe
  ]
})
export class OccurrencesAccordionComponent implements OnInit {
  @Input() id: number | undefined = undefined;
  @Input() type: string = '';

  groupedTexts: any[] = [];
  isLoading: boolean = true;
  occurrenceData: any[] = [];
  showPublishedStatus: number = 2;
  simpleWorkMetadata: boolean = false;

  constructor(
    private commonFunctions: CommonFunctionsService,
    private semanticDataService: SemanticDataService,
    private tocService: TableOfContentsService
  ) {
    this.simpleWorkMetadata = config.modal?.semanticDataObject?.useSimpleWorkMetadata ?? false;
  }

  ngOnInit() {
    if (this.type === 'keyword') {
      this.showPublishedStatus = config.page?.index?.keywords?.publishedStatus ?? 2;
    } else if (this.type === 'person') {
      this.showPublishedStatus = config.page?.index?.persons?.publishedStatus ?? 2;
    } else if (this.type === 'place') {
      this.showPublishedStatus = config.page?.index?.places?.publishedStatus ?? 2;
    } else if (this.type === 'work') {
      this.showPublishedStatus = config.page?.index?.works?.publishedStatus ?? 2;
    }

    if (this.type === 'work' && this.simpleWorkMetadata) {
      this.isLoading = false;
    } else if (this.id && this.type) {
      this.getOccurrenceData(this.id);
    }
  }

  private getOccurrenceData(id: any) {
    this.isLoading = true;
    let objectType = this.type;
    if (objectType === 'work') {
      objectType = 'work_manifestation';
    }
    this.semanticDataService.getOccurrences(objectType, id).subscribe({
      next: (occ: any) => {
        occ.forEach((item: any) => {
          if (item.occurrences?.length) {
            for (const occurence of item.occurrences) {
              this.categorizeOccurrence(occurence);
            }
          }
        });
        // Sort collection names alphabetically
        this.commonFunctions.sortArrayOfObjectsAlphabetically(this.groupedTexts, 'name');

        // Replace publication names (from the database) with the names
        // in the collection TOC-file and sort by publication name.
        this.updateAndSortPublicationNamesInOccurrenceResults();

        this.occurrenceData = this.groupedTexts;
        this.isLoading = false;
      },
      error: (err: any) => {
        console.error('Error getting occurrence texts', err);
        this.isLoading = false;
      }
    });
  }

  private categorizeOccurrence(occurrence: Occurrence) {
    if (
        occurrence.publication_id &&
        !occurrence.publication_manuscript_id &&
        !occurrence.publication_comment_id &&
        !occurrence.publication_facsimile_id &&
        !occurrence.publication_version_id
      ) {
        this.setOccurrenceType(occurrence, 'est');
    } else {
      if (occurrence.publication_manuscript_id) {
        this.setOccurrenceType(occurrence, 'ms');
      }
      if (occurrence.publication_version_id) {
        this.setOccurrenceType(occurrence, 'var');
      }
      if (occurrence.publication_comment_id) {
        this.setOccurrenceType(occurrence, 'com');
      }
      if (occurrence.publication_facsimile_id) {
        this.setOccurrenceType(occurrence, 'facs')
      }
    }
  }

  private setOccurrenceType(occ: Occurrence, type: string) {
    const newOccurrence = new SingleOccurrence();
    const fileName = occ.original_filename ?? (
      occ.collection_id + '_' + occ.publication_id + '.xml'
    );

    newOccurrence.linkID = fileName?.split('.xml')[0];
    newOccurrence.collectionID = occ.collection_id && occ.publication_id ?
      occ.collection_id + '_' + occ.publication_id
      : newOccurrence.linkID?.split('_' + type)[0];
    newOccurrence.filename = fileName;
    newOccurrence.textType = type;
    newOccurrence.title = occ.name;
    newOccurrence.collectionName = occ.collection_name;
    newOccurrence.displayName = occ.publication_name ? occ.publication_name : occ.collection_name;
    newOccurrence.publication_manuscript_id = occ.publication_manuscript_id;
    newOccurrence.publication_version_id = occ.publication_version_id;
    newOccurrence.publication_facsimile_id = occ.publication_facsimile_id;
    newOccurrence.facsimilePage = occ.publication_facsimile_page;
    newOccurrence.description = occ.description || null;
    this.setOccurrenceTree(newOccurrence, occ);
  }

  private setOccurrenceTree(newOccurrence: any, occ: any) {
    let foundCollection = false;
    for (let i = 0; i < this.groupedTexts.length; i++) {
      if (this.groupedTexts[i].collection_id === occ.collection_id) {
        foundCollection = true;
        let foundPublication = false;
        for (let j = 0; j < this.groupedTexts[i].publications.length; j++) {
          if (this.groupedTexts[i].publications[j].publication_id === occ.publication_id) {
            this.groupedTexts[i].publications[j].occurrences.push(newOccurrence);
            foundPublication = true;
            break;
          }
        }
        if (!foundPublication && occ.publication_published >= this.showPublishedStatus) {
          const item = {
            publication_id: occ.publication_id,
            name: occ.publication_name,
            occurrences: [newOccurrence]
          };
          this.groupedTexts[i].publications.push(item);
        }
        break;
      }
    }

    if (!foundCollection) {
      if (occ.collection_name === undefined) {
        occ.collection_name = occ.publication_collection_name;
      }
      if (occ.publication_published >= this.showPublishedStatus) {
        const item = {
          collection_id: occ.collection_id,
          name: occ.collection_name,
          hidden: true,
          publications: [
            {
              publication_id: occ.publication_id,
              name: occ.publication_name,
              occurrences: [newOccurrence]
            }
          ]
        };
        this.groupedTexts.push(item);
      }
    }
  }

  private updateAndSortPublicationNamesInOccurrenceResults() {
    // Loop through each collection with occurrence results, get TOC for each collection,
    // then loop through each publication with occurrence results in each collection and
    // update publication names from TOC-files. Finally, sort the publication names.
    this.groupedTexts.forEach((item: any) => {
      if (item.collection_id && item.publications) {
        this.tocService.getTableOfContents(item.collection_id).subscribe(
          (tocData: any) => {
            const flattenedTocData: any[] = this.commonFunctions.flattenObjectTree(
              tocData, 'children', 'itemId'
            );
            item.publications.forEach((pub: any) => {
              const id = item.collection_id + '_' + pub.publication_id;
              flattenedTocData.forEach((tocItem: any) => {
                if (id === tocItem['itemId']) {
                  pub.occurrences[0].displayName = String(tocItem['text']);
                  pub.name = String(tocItem['text']);
                }
              });
              if (pub.occurrences?.length > 1) {
                this.commonFunctions.sortArrayOfObjectsAlphabetically(pub.occurrences, 'textType');
              }
            });
            if (item.publications !== undefined) {
              this.commonFunctions.sortArrayOfObjectsAlphabetically(item.publications, 'name');
            }
          }
        );
      }
    });
  }

  toggleList(id: any) {
    for (let i = 0; i < this.groupedTexts.length; i++) {
      if (id === this.groupedTexts[i]['collection_id']) {
        this.groupedTexts[i].hidden ? this.groupedTexts[i].hidden = false : this.groupedTexts[i].hidden = true;
      }
    }
  }

}
