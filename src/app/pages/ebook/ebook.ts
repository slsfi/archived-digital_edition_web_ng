import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UserSettingsService } from 'src/app/services/user-settings.service';


@Component({
  selector: 'page-ebook',
  templateUrl: 'ebook.html',
  styleUrls: ['ebook.scss'],
})

export class EbookPage implements OnInit {
  public epubFileName: string = '';

  constructor(
    private userSettingsService: UserSettingsService,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.epubFileName = params['selectedFile'];
    })
  }

  printContentClasses() {
    if (this.userSettingsService.isMobile()) {
      return 'mobile-view-epub';
    } else {
      return '';
    }
  }

}
