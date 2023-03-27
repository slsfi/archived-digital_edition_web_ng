import { Component, Input } from "@angular/core";
import { TableOfContentsService } from "../../services/toc/table-of-contents.service";
import { config } from "../../services/config/config";
import { ActivatedRoute } from "@angular/router";

@Component({
  selector: 'table-of-content',
  templateUrl: 'table-of-content.html',
  styleUrls: ['table-of-content.scss']
})

export class TableOfContent {
  @Input() collectionId: string;
  collectionContent: any;
  isLoading: boolean = true;
  _config = config;
  selectedMenu = {
    collectionID: '',
    publicationID: '',
    chapterID: ''
  }
  constructor(private tocService: TableOfContentsService, private route: ActivatedRoute,) {}
  ngOnInit() {
    this.tocService.getTableOfContents(this.collectionId).subscribe(data => {
      this.collectionContent = data;
      this.isLoading = false;
      console.log(data)
    })
    this.route.params.subscribe(data => {
      console.log(data)
      this.selectedMenu = {
        collectionID: data.collectionID,
        publicationID: data.publicationID,
        chapterID: data.chapterID
      }
    })
  }
}
