import { Component, Inject, LOCALE_ID, OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { MdContentService } from 'src/app/services/md/md-content.service';
import { UserSettingsService } from 'src/app/services/settings/user-settings.service';
import { TextService } from 'src/app/services/texts/text.service';
import { config } from "src/assets/config/config";


@Component({
  selector: 'page-cover',
  templateUrl: 'collection-cover.html',
  styleUrls: ['collection-cover.scss']
})

export class CollectionCoverPage implements OnInit {
  image_alt = '';
  image_src = '';
  hasMDCover = '';
  hasDigitalEditionListChildren = false;
  childrenPdfs = [];
  id: string = '';
  text: any;
  collection: any;
  coverSelected: boolean;

  constructor(
    private textService: TextService,
    protected sanitizer: DomSanitizer,
    public userSettingsService: UserSettingsService,
    private mdContentService: MdContentService,
    private route: ActivatedRoute,
    @Inject(LOCALE_ID) public activeLocale: string
  ) {
    this.coverSelected = true;
    this.hasMDCover = config.ProjectStaticMarkdownCoversFolder ?? '';
  }

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.id = params['collectionID'];
      this.checkIfCollectionHasChildrenPdfs();
      this.loadCover(this.activeLocale, this.id);
    });
  }

  checkIfCollectionHasChildrenPdfs() {
    const configChildrenPdfs = config.collectionChildrenPdfs?.[this.id] ?? [];

    if (configChildrenPdfs.length) {
      this.childrenPdfs = configChildrenPdfs;
      this.hasDigitalEditionListChildren = true;
    }
  }

  loadCover(lang: string, id: string) {
    if (!isNaN(Number(id))) {
      if (!this.hasMDCover) {
        /**
         * ! The necessary API endpoint for getting the cover page via textService has not been
         * ! implemented, so getting the cover this way does not work. It has to be given in a
         * ! markdown file.
         */
        this.textService.getCoverPage(id, lang).subscribe({
          next: (res) => {
            // in order to get id attributes for tooltips
            this.text = this.sanitizer.bypassSecurityTrustHtml(
              res.content.replace(/images\//g, 'assets/images/')
                .replace(/\.png/g, '.svg')
            );
          }
        });
      } else {
        this.getCoverImageFromMdContent(`${lang}-${this.hasMDCover}-${id}`);
      }
    }
  }

  getCoverImageFromMdContent(fileID: string) {
    this.mdContentService.getMdContent(fileID).subscribe({
      next: (text) => {
        // Extract image url and alt-text from markdown content.
        this.image_alt = text.content.match(/!\[(.*?)\]\(.*?\)/)[1];
        if (this.image_alt === null) {
          this.image_alt = 'Cover image';
        }
        this.image_src = text.content.match(/!\[.*?\]\((.*?)\)/)[1];
        if (this.image_src === null) {
          this.image_src = '';
        }
      }
    });
  }

  printMainContentClasses() {
    if (this.userSettingsService.isMobile()) {
      return 'mobile-mode-content';
    } else {
      return '';
    }
  }

}
