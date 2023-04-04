import { Component, Inject, LOCALE_ID } from '@angular/core';
import { MdContentService } from 'src/app/services/md/md-content.service';
import { UserSettingsService } from 'src/app/services/settings/user-settings.service';

/**
 * List of collections.
 */

// @IonicPage({
//   segment: 'publications'
// })
@Component({
  selector: 'editions-page',
  templateUrl: 'editions.html',
  styleUrls: ['editions.scss']
})
export class EditionsPage {
  readContent: string = '';

  constructor(
    private mdContentService: MdContentService,
    public userSettingsService: UserSettingsService,
    @Inject(LOCALE_ID) public activeLocale: string
  ) {}

  ngOnInit() {
    this.getMdContent(this.activeLocale + '-02');
  }

  getMdContent(fileID: string) {
    this.mdContentService.getMdContent(fileID).subscribe({
      next: (text) => {
        this.readContent = text.content.trim();
      }
    });
  }

}
