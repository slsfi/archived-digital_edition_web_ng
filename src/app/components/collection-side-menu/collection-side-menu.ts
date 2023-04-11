import { Component, ChangeDetectorRef, Input, OnChanges, SimpleChanges } from "@angular/core";
import { Params, UrlSegment } from "@angular/router";
import { CommonFunctionsService } from "src/app/services/common-functions/common-functions.service";
import { TableOfContentsService } from "src/app/services/toc/table-of-contents.service";
import { config } from "src/app/services/config/config";
import { isBrowser } from "src/standalone/utility-functions";

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
  collectionTitle: string = '';
  isLoading: boolean = true;
  _config = config;
  selectedMenu: string[] = [];
  highlightedMenu: string;
  constructor(
    private tocService: TableOfContentsService,
    public commonFunctions: CommonFunctionsService,
    public cref: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.tocService.getTableOfContents(this.collectionID).subscribe(data => {
      if (data && data.children && data.children.length) {
        this.recursiveInitializeSelectedMenu(data.children);
        this.collectionContent = data;
        this.collectionTitle = data.text;
        this.isLoading = false;
        this.commonFunctions.setTitle(this.collectionTitle, 1);
        const itemId = this.getItemId();
        this.highlightedMenu = itemId;

        const item = this.recursiveFinding(data.children, itemId);
        if (item && !this.selectedMenu.includes(item.itemId || item.nodeId)) {
          this.selectedMenu.push(item.itemId || item.nodeId);
        } else {
          this.setTitleForFrontMatterPages();
        }
        this.scrollHighlightedMenuItemIntoView(itemId);
      }
    });
  }
  ngOnChanges(changes: SimpleChanges) {
    if (this.collectionContent) {
      // Check if the changed input values are relevant, i.e. require the side menu to be updated.
      // If just some other queryParams than position have changed, no action is necessary in the menu.
      let relevantChange = false;
      for (const propName in changes) {
        if (changes.hasOwnProperty(propName)) {
          if (
            propName === 'collectionID' &&
            changes.collectionID.previousValue !== changes.collectionID.currentValue
          ) {
            relevantChange = true;
            break;
          } else if (
            propName === 'initialUrlSegments' &&
            JSON.stringify(changes.initialUrlSegments.previousValue) !== JSON.stringify(changes.initialUrlSegments.currentValue)
          ) {
            relevantChange = true;
            break;
          } else if (
            propName === 'initialQueryParams' &&
            changes.initialQueryParams.previousValue.position !== changes.initialQueryParams.currentValue.position
          ) {
            relevantChange = true;
            break;
          }
        }
      }

      if (relevantChange) {
        const itemId = this.getItemId();
        this.highlightedMenu = itemId;
        const isFrontMatterPage = this.setTitleForFrontMatterPages();
        if (!isFrontMatterPage) {
          const item = this.recursiveFinding(this.collectionContent.children, itemId);
          if (item && !this.selectedMenu.includes(item.itemId || item.nodeId)) {
            this.selectedMenu.push(item.itemId || item.nodeId);
            // Angular is not good at detecting changes within arrays and objects, so we have to manually trigger an update of the view
            this.cref.detectChanges();
          }
        }
        this.scrollHighlightedMenuItemIntoView(itemId);
      }
    }
  }

  setTitleForFrontMatterPages() {
    const pageTitle = this.initialUrlSegments[2].path;
    switch (pageTitle) {
      case 'cover':
        this.commonFunctions.setTitle($localize`:@@Read.CoverPage.Title:Omslag`, 2);
        return true;
      case 'title':
        this.commonFunctions.setTitle($localize`:@@Read.TitlePage.Title:Titelblad`, 2);
        return true;
      case 'foreword':
        this.commonFunctions.setTitle($localize`:@@Read.ForewordPage.Title:Förord`, 2);
        return true;
      case 'introduction':
        this.commonFunctions.setTitle($localize`:@@Read.Introduction.Title:Inledning`, 2);
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
    return itemId;
  }

  toggle(menuItem: any) {
    this.commonFunctions.addOrRemoveValueInArray(this.selectedMenu, menuItem.itemId || menuItem.nodeId);
    if(menuItem.itemId) {
      this.commonFunctions.setTitle(menuItem.text, 2);
    }
  }
  recursiveFinding(array: any[], stringForComparison: string): any {
    return array.find(item => {
      if (item.itemId === stringForComparison) {
        this.commonFunctions.setTitle(item.text, 2);
        return item;
      } else if (item.children) {
        const result = this.recursiveFinding(item.children, stringForComparison);
        if (result && !this.selectedMenu.includes(result.itemId || result.nodeId)) {
          this.selectedMenu.push(result.itemId || result.nodeId);
        }
        return result;
      } else {
        return undefined;
      }
    })
  }

  /**
   * Recursively add nodeId property to each object in the array and push any items
   * with collapsed property false to selectedMenu. nodeId is a string starting
   * with "n" and followed by running numbers. Each new branch is indicated by a
   * dash and the counter is reset. For example: n1-1-2. This way each item gets
   * a unique identifier.
   */
  recursiveInitializeSelectedMenu(array: any[], parentNodeId?: string) {
    for (let i = 0; i < array.length; i++) {
      array[i]["nodeId"] = (parentNodeId ? parentNodeId + '-' : 'n') + (i+1);
      if (array[i]["collapsed"] === false) {
        if (array[i]["itemId"]) {
          this.selectedMenu.push(array[i]["itemId"]);
        } else {
          this.selectedMenu.push(array[i]["nodeId"]);
        }
      }
      if (array[i]["children"] && array[i]["children"].length) {
        this.recursiveInitializeSelectedMenu(array[i]["children"], array[i]["nodeId"]);
      }
    }
  }

  scrollHighlightedMenuItemIntoView(itemId: string) {
    if (isBrowser()) {
      setTimeout(() => {
        const container = document.querySelector('.side-navigation') as HTMLElement;
        const target = document.querySelector('collection-side-menu .menu-highlight[data-id="' + 'toc_' + itemId + '"]') as HTMLElement;
        if (container && target) {
          this.commonFunctions.scrollElementIntoView(target, 'center', 0, 'smooth', container);
        }
      }, 600);
    }
  }

}
