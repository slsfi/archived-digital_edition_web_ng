import { Component, Input } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { TableOfContentsService } from "src/app/services/toc/table-of-contents.service";
import { config } from "src/app/services/config/config";

@Component({
  selector: 'collection-side-menu',
  templateUrl: 'collection-side-menu.html',
  styleUrls: ['collection-side-menu.scss']
})

export class CollectionSideMenu {
  @Input() collectionID: string;
  collectionContent: any;
  isLoading: boolean = true;
  _config = config;
  selectedMenu = {
    collectionID: '',
    publicationID: '',
    chapterID: ''
  }

  constructor(
    private tocService: TableOfContentsService,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    console.log('collection side menu initialized');

    this.tocService.getTableOfContents(this.collectionID).subscribe(data => {
      this.collectionContent = data;
      this.isLoading = false;
      console.log('tocService response:', data);
    });

    // ! ActivatedRoute only works for components loaded via router-outlet, so this will always return an empty object since this component is outside the router-outlet defined in app.component.html.
    // ! Find another way to get the current text.
    this.route.params.subscribe({
      next: (params) => {
        console.log('route.params: ', params);
        this.selectedMenu = {
          collectionID: params.collectionID,
          publicationID: params.publicationID,
          chapterID: params.chapterID
        }
      }
    });
  }

}
