import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NavController, Platform, PopoverController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { EventsService } from 'src/app/services/events/events.service';
import { UserSettingsService } from 'src/app/services/settings/user-settings.service';

// @IonicPage({
//   name: 'epub',
//   segment: 'epub/:selectedFile'
// })
@Component({
  selector: 'page-epub',
  templateUrl: 'epub.html',
  styleUrls: ['epub.scss'],
})
export class EpubPage {

  public epubFileName: string = '';
  constructor(
    protected navCtrl: NavController,
    protected popoverCtrl: PopoverController,
    protected translate: TranslateService,
    protected events: EventsService,
    protected platform: Platform,
    private userSettingsService: UserSettingsService,
    private route: ActivatedRoute
  ) {
    // this.epubFileName = this.params.get('selectedFile');
  }

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.epubFileName = params['selectedFile'];
    })
  }

  printContentClasses() {
    if (this.userSettingsService.isMobile() || this.userSettingsService.isTablet()) {
      return 'mobile-view-epub';
    } else {
      return '';
    }
  }

}
