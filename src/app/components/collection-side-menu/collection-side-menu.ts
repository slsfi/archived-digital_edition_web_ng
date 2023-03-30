import { Component, Input } from "@angular/core";
import {
  Params,
  UrlSegment
} from "@angular/router";
import { TableOfContentsService } from "src/app/services/toc/table-of-contents.service";
import { config } from "src/app/services/config/config";

@Component({
  selector: 'collection-side-menu',
  templateUrl: 'collection-side-menu.html',
  styleUrls: ['collection-side-menu.scss']
})

export class CollectionSideMenu {
  @Input() collectionID: string;
  @Input() initialUrlSegments: UrlSegment[];
  @Input() initialQueryParams: Params;
  collectionContent: any;
  isLoading: boolean = true;
  _config = config;
  selectedMenu: string[] = []

  constructor(
    private tocService: TableOfContentsService
  ) {}

  ngOnInit() {
    this.tocService.getTableOfContents(this.collectionID).subscribe(data => {
      this.collectionContent = data;
      this.isLoading = false;
      console.log('tocService response:', data);

      const itemId = `${this.initialUrlSegments[1].path}_${this.initialUrlSegments[3].path}_${this.initialUrlSegments[4].path}${this.initialQueryParams.position ? `;${this.initialQueryParams.position}` : ''}`
      this.recursiveFinding(data.children, itemId);
    });

  }
  toggle(menuId: string, menuLevel: number) {
    if(this.selectedMenu.includes(menuId))
      this.selectedMenu.splice(menuLevel)
    else if(!menuLevel){
      this.selectedMenu = [menuId];
    }
    else {
      this.selectedMenu.splice(menuLevel);
      this.selectedMenu.push(menuId);
    }
  }
  recursiveFinding(array: any[], stringForComparison: string): boolean {
    return array.some(item => {
      if(item.children) {
        const res = this.recursiveFinding(item.children, stringForComparison)
        if(res)
          this.selectedMenu.unshift(item.itemId || item.text)
        return res;
      } else {
        if(item.itemId === stringForComparison){
          this.selectedMenu.unshift(item.itemId || item.text)
        }
        return item.itemId === stringForComparison;
      }
    })
  }
}
