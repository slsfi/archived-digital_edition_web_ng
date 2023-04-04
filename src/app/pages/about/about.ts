import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { MdContentService } from 'src/app/services/md/md-content.service';


@Component({
  selector: 'page-about',
  templateUrl: 'about.html',
  styleUrls: ['about.scss']
})
export class AboutPage {

  mdText: string = '';
  fileID: string = '';
  routeParamsSubscription: Subscription | null = null;

  constructor(
    private mdContentService: MdContentService,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.routeParamsSubscription = this.route.params.subscribe(params => {
      if (this.fileID !== params['id']) {
        this.fileID = params['id'];
        if (this.fileID) {
          this.getMdContent(this.fileID);
        }
      }
    });
  }

  ngOnDestroy() {
    if (this.routeParamsSubscription) {
      this.routeParamsSubscription.unsubscribe();
    }
  }

  getMdContent(fileID: string) {
    this.mdContentService.getMdContent(fileID).subscribe({
      next: (text) => {
        this.mdText = text.content;
      },
      error: (e) => {
        this.mdText = '';
      }
    });
  }

}
