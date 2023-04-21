import { Component, Input } from '@angular/core';
import { UserSettingsService } from 'src/app/services/settings/user-settings.service';
import { config } from "src/assets/config/config";


@Component({
  selector: 'digital-edition-list-children',
  templateUrl: 'digital-edition-list-children.html',
  styleUrls: ['digital-edition-list-children.scss']
})
export class DigitalEditionListChildrenComponent {
  @Input() layoutType?: string;
  @Input() childrenPdfs: any;
  @Input() collectionID?: any;

  show = false;
  apiEndPoint: string;
  projectMachineName: string;
  collectionDownloads: any;

  constructor(
    public userSettingsService: UserSettingsService
  ) {
    this.apiEndPoint = config.app?.apiEndpoint ?? '';
    this.projectMachineName = config.app?.machineName ?? '';
    this.collectionDownloads = config.collectionDownloads ?? [];
  }

  ngOnInit() {
    if (this.childrenPdfs !== undefined && this.childrenPdfs.length) {
      this.setThumbnails(this.childrenPdfs);
      this.setPDF();
    }
  }

  setPDF() {
    for (let i = 0; i < this.childrenPdfs.length; i++) {
      if ( this.collectionDownloads['pdf'] !== undefined &&
      this.collectionDownloads['pdf'][String(this.childrenPdfs[i].collectionId)] !== undefined ) {
        if ( this.childrenPdfs[i] !== undefined ) {
          this.childrenPdfs[i]['pdf'] = {
            'url': this.collectionDownloads['pdf'][String(this.childrenPdfs[i].collectionId)].title,
            'isDownload': (String(this.childrenPdfs[i].url).length > 0) ? true : false
          };
        }
        this.childrenPdfs[i].isDownload = (String(this.childrenPdfs[i].url).length > 0) ? true : false;
        this.childrenPdfs[i].pdfFile = this.collectionDownloads['pdf'][String(this.childrenPdfs[i].collectionId)].title;
      }

      if ( this.collectionDownloads['epub'] !== undefined && this.childrenPdfs[i].collectionId in this.collectionDownloads['epub'] ) {
        if ( this.childrenPdfs[i] !== undefined ) {
          this.childrenPdfs[i]['epub'] = {
            'url': this.collectionDownloads['epub'][String(this.childrenPdfs[i].collectionId)].title,
            'isDownload': (String(this.childrenPdfs[i].url).length > 0) ? true : false
          };
        }
        this.childrenPdfs[i].isDownload = (String(this.childrenPdfs[i].url).length > 0) ? true : false;
      }
    }
  }

  downloadBook(event: Event, collection: any, type: any) {
    event.stopPropagation();
    if (collection.isDownload) {
      if (collection.collectionId in this.collectionDownloads['pdf'] && type === 'pdf') {
        const dURL = this.apiEndPoint + '/' + this.projectMachineName + '/files/' + collection.collectionId + '/pdf/' +
          this.collectionDownloads['pdf'][collection.collectionId].title + '/' +
          this.collectionDownloads['pdf'][collection.collectionId].title;


        console.log("#### WINDOW 6");
        const ref = window.open(dURL);

      } else if (collection.collectionId in this.collectionDownloads['epub'] && type === 'epub') {
        const dURL = this.apiEndPoint + '/' + this.projectMachineName + '/files/' + collection.collectionId + '/epub/' +
          this.collectionDownloads['epub'][collection.collectionId].title + '/' +
          this.collectionDownloads['epub'][collection.collectionId].title;

        console.log("#### WINDOW 7");
        const ref = window.open(dURL);
      }
    }
  }

  setThumbnails(childrenPdfs: any) {
    for (const edition of childrenPdfs) {
      let imageType = 'jpg';

      if (edition['cover'] === undefined && edition['thumbnail'] !== undefined) {
        edition['cover'] = edition.thumbnail;
      }

      if (edition.cover.includes('.png')) {
        imageType = 'png';
      }

      const coverImage = edition.cover.split(`.${imageType}`)[0];
      edition['thumbnail'] = `assets/images/cover_pages/${coverImage}.${imageType}`;
    }

    this.show = true;
  }

  downloadPDF(event: any, edition: any) {
    if (event && event.stopPropagation) {
      event.stopPropagation();
    }
    const isChildPdf = true;
    const dURL = this.apiEndPoint + '/' + this.projectMachineName + '/files/' + this.collectionID + '/pdf/' +
    edition.pdfFile + '/' + isChildPdf;

    console.log("#### WINDOW 8");
    const ref = window.open(dURL, '_self', 'location=no');
  }

}
