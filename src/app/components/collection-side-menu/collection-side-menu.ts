import { Component, Input, OnChanges } from "@angular/core";
import {
  Params, Router,
  UrlSegment
} from "@angular/router";
import { TableOfContentsService } from "src/app/services/toc/table-of-contents.service";
import { config } from "src/app/services/config/config";
import { CommonFunctionsService } from "../../services/common-functions/common-functions.service";

@Component({
  selector: 'collection-side-menu',
  templateUrl: 'collection-side-menu.html',
  styleUrls: ['collection-side-menu.scss']
})

export class CollectionSideMenu implements OnChanges {
  @Input() collectionID: string;
  @Input() initialUrlSegments: UrlSegment[];
  @Input() initialQueryParams: Params;
  collectionContent: any;
  isLoading: boolean = true;
  _config = config;
  selectedMenu: string[] = []
  highlightedMenu: string;
  constructor(
    private tocService: TableOfContentsService,
    public router: Router,
    public commonFunctions: CommonFunctionsService,
  ) {}

  ngOnInit() {
    this.tocService.getTableOfContents(this.collectionID).subscribe(data => {
      this.collectionContent = data;
      this.isLoading = false;
      console.log('tocService response:', data);
      this.commonFunctions.setTitle(data.text, 1);
      const itemId = this.getItemId();
      this.highlightedMenu = itemId

      let item = this.recursiveFinding(data.children, itemId);
      if(item) {
        this.selectedMenu.push(item.itemId || item.text)
      } else {
        this.setTitleForDefaultPages();
      }
    });
  }
  ngOnChanges() {
    this.highlightedMenu = this.getItemId();
    // ngOnChanges also watches changes of collectionID, initialUrlSegments, initialQueryParams which are from router
    // so, just for now, there's no need for router subscription
    let isSet = this.setTitleForDefaultPages();
    if(!isSet && this.collectionContent){
      let item = this.recursiveFinding(this.collectionContent.children, this.getItemId());
      if(item && !this.selectedMenu.includes(item.itemId || item.text))
        this.selectedMenu.push(item.itemId || item.text)
    }
  }

  setTitleForDefaultPages() {
    const pageTitle = this.router.url.split('/').slice(-1).join();
    switch (pageTitle) {
      case 'cover':
        this.commonFunctions.setTitle($localize`:@@Read.CoverPage.Title:Omslag`,2);
        return true;
      case 'title':
        this.commonFunctions.setTitle($localize`:@@Read.CoverPage.TitlePage:Titelblad`,2);
        return true;
      case 'foreword':
        this.commonFunctions.setTitle($localize`:@@Read.CoverPage.ForewordPage:Förord`,2);
        return true;
      case 'introduction':
        this.commonFunctions.setTitle($localize`:@@Read.CoverPage.Introduction:Inledning`,2);
        return true;
      default:
        return false;
    }
  }

  getItemId(): string {
    let itemId = '';
    itemId += this.initialUrlSegments[1]?.path ? `${this.initialUrlSegments[1].path}` : '';
    itemId += this.initialUrlSegments[3]?.path ? `_${this.initialUrlSegments[3].path}` : '';
    itemId += this.initialUrlSegments[4]?.path ? `_${this.initialUrlSegments[4].path}` : '';

    itemId += this.initialQueryParams.position ? `;${this.initialQueryParams.position}` : '';
    return itemId
  }

  toggle(menuItem: any) {
    this.commonFunctions.addOrRemoveValueInArray(this.selectedMenu, menuItem.itemId || menuItem.text)
    if(menuItem.itemId) {
      this.commonFunctions.setTitle(menuItem.text,2);
    }
  }
  recursiveFinding(array: any[], stringForComparison: string): any {
    return array.find(item => {
      if(item.children) {
        const result = this.recursiveFinding(item.children, stringForComparison)
        if(result && !this.selectedMenu.includes(result.itemId || result.text))
          this.selectedMenu.push(result.itemId || result.text)
        return result;
      } else {
        if(item.itemId === stringForComparison) {
          this.commonFunctions.setTitle(item.text,2);
          return item;
        }
        return undefined;
      }
    })
  }
}
