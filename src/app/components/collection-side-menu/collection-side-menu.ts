import { Component, ChangeDetectorRef, Input, OnChanges, OnInit, SimpleChanges, OnDestroy } from "@angular/core";
import { Params, UrlSegment } from "@angular/router";
import { CommonFunctionsService } from "src/app/services/common-functions/common-functions.service";
import { TableOfContentsService } from "src/app/services/toc/table-of-contents.service";
import { config } from "src/assets/config/config";
import { isBrowser } from "src/standalone/utility-functions";


@Component({
  selector: 'collection-side-menu',
  templateUrl: 'collection-side-menu.html',
  styleUrls: ['collection-side-menu.scss']
})
export class CollectionSideMenu implements OnInit, OnChanges, OnDestroy {
  @Input() collectionID: string;
  @Input() initialUrlSegments: UrlSegment[];
  @Input() initialQueryParams: Params;
  collectionMenu: any[] = [];
  collectionTitle: string = '';
  isLoading: boolean = true;
  _config = config;
  selectedMenu: string[] = [];
  highlightedMenu: string;
  sortOptions: string[] = [];
  defaultMenu: any;
  alphabeticalMenu: any[] = [];
  chronologicalMenu: any[] = [];
  categoricalMenu: any[] = [];
  activeMenuSorting: string = 'default';
  sortSelectOptions: Record<string, any> = {};

  constructor(
    private tocService: TableOfContentsService,
    public commonFunctions: CommonFunctionsService,
    public cref: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.sortOptions = this.setSortOptions(this.collectionID);
    this.tocService.getTableOfContents(this.collectionID).subscribe({
      next: (data) => {
        if (data && data.children && data.children.length) {
          this.recursiveInitializeSelectedMenu(data.children);
          this.collectionTitle = data.text || '';
          this.collectionMenu = data.children;
          this.defaultMenu = data.children;
          this.isLoading = false;
          this.commonFunctions.setTitle(this.collectionTitle, 1);
          this.updateHighlightedMenuItem();

          // Construct sorted menus
          if (this.sortOptions.length > 0) {
            const flattenedMenu = this.commonFunctions.flattenObjectTree(data);
            if (this.sortOptions.includes('alphabetical')) {
              this.alphabeticalMenu = this.constructAlphabeticalMenu(flattenedMenu);
            }
            if (this.sortOptions.includes('chronological')) {
              this.chronologicalMenu = this.constructCategoricalMenu(flattenedMenu, 'date');
            }
            if (this.sortOptions.includes('categorical')) {
              const primaryKey = this._config.component?.sideMenu?.categoricalSortingPrimaryKey ?? 'date';
              const secondaryKey = this._config.component?.sideMenu?.categoricalSortingSecondaryKey ?? '';
              this.categoricalMenu = this.constructCategoricalMenu(flattenedMenu, primaryKey, secondaryKey);
            }
            this.sortSelectOptions = {
              header: $localize`:@@TOC.SortOptions.SortTOC:Välj sortering för innehållsförteckningen`,
              cssClass: 'custom-select-alert'
            }
          }
        }
      }
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (this.collectionMenu) {
      // Check if the changed input values are relevant, i.e. require the side menu to be updated.
      // If just some other queryParams than position have changed, no action is necessary in the menu.
      let relevantChange = false;
      for (const propName in changes) {
        if (changes.hasOwnProperty(propName)) {
          if (
            propName === 'collectionID' &&
            changes.collectionID.previousValue !== changes.collectionID.currentValue
          ) {
            if (!changes.collectionID.firstChange) {
              this.tocService.setActiveTocOrder('default');
            }
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
        this.updateHighlightedMenuItem();
      }
    }
  }

  ngOnDestroy() {
    this.tocService.setActiveTocOrder('default');
  }

  updateHighlightedMenuItem(scrollTimeout: number = 600) {
    const itemId = this.getItemId();
    this.highlightedMenu = itemId;
    const isFrontMatterPage = this.setTitleForFrontMatterPages();
    if (!isFrontMatterPage) {
      const item = this.recursiveFinding(this.collectionMenu, itemId);
      if (item && !this.selectedMenu.includes(item.itemId || item.nodeId)) {
        this.selectedMenu.push(item.itemId || item.nodeId);
      }
    }
    // Angular is not good at detecting changes within arrays and objects, so we have to manually trigger an update of the view
    this.cref.detectChanges();
    this.scrollHighlightedMenuItemIntoView(itemId, scrollTimeout);
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

  scrollHighlightedMenuItemIntoView(itemId: string, scrollTimeout: number = 600) {
    if (isBrowser()) {
      setTimeout(() => {
        const container = document.querySelector('.side-navigation') as HTMLElement;
        const target = document.querySelector('collection-side-menu [data-id="' + 'toc_' + itemId + '"] .menu-highlight') as HTMLElement;
        if (container && target) {
          this.commonFunctions.scrollElementIntoView(target, 'center', 0, 'smooth', container);
        }
      }, scrollTimeout);
    }
  }

  setSortOptions(collectionID: string) {
    const sortOptions: string[] = [];
    if (this._config.component?.sideMenu?.sortableCollectionsAlphabetical?.includes(collectionID)) {
      sortOptions.push('alphabetical');
    }
    if (this._config.component?.sideMenu?.sortableCollectionsChronological?.includes(collectionID)) {
      sortOptions.push('chronological');
    }
    if (this._config.component?.sideMenu?.sortableCollectionsCategorical?.includes(collectionID)) {
      sortOptions.push('categorical');
    }
    return sortOptions;
  }

  constructAlphabeticalMenu(flattenedMenuData: any[]) {
    const alphabeticalMenu: any[] = [];

    for (const child of flattenedMenuData) {
      if (child.itemId) {
        alphabeticalMenu.push(child);
      }
    }

    this.commonFunctions.sortArrayOfObjectsAlphabetically(alphabeticalMenu, 'text');
    return alphabeticalMenu;
  }

  constructCategoricalMenu(flattenedMenuData: any[], primarySortKey: string, secondarySortKey?: string) {
    const orderedList: any[] = [];

    for (const child of flattenedMenuData) {
      if (
        child[primarySortKey] &&
        ((secondarySortKey && child[secondarySortKey]) || !secondarySortKey) &&
        child.itemId
      ) {
        orderedList.push(child);
      }
    }

    if (primarySortKey === 'date') {
      this.commonFunctions.sortArrayOfObjectsNumerically(orderedList, primarySortKey, 'asc');
    } else {
      this.commonFunctions.sortArrayOfObjectsAlphabetically(orderedList, primarySortKey);
    }

    const categoricalMenu: any[] = [];
    let childItems: any[] = [];
    let prevCategory = '';

    for (let i = 0; i < orderedList.length; i++) {
      let currentCategory = orderedList[i][primarySortKey];
      if (primarySortKey === 'date') {
        currentCategory = String(currentCategory).split('-')[0];
      }

      if (prevCategory === '') {
        prevCategory = currentCategory;
        categoricalMenu.push({type: 'subtitle', collapsed: true, text: prevCategory, children: []});
      }

      if (prevCategory !== currentCategory) {
        if (secondarySortKey === 'date') {
          this.commonFunctions.sortArrayOfObjectsNumerically(childItems, secondarySortKey, 'asc');
        } else if (secondarySortKey) {
          this.commonFunctions.sortArrayOfObjectsAlphabetically(childItems, secondarySortKey);
        }
        categoricalMenu[categoricalMenu.length - 1].children = childItems;
        childItems = [];
        prevCategory = currentCategory;
        categoricalMenu.push({type: 'subtitle', collapsed: true, text: prevCategory, children: []});
      }
      childItems.push(orderedList[i]);
    }

    if (childItems.length > 0) {
      if (secondarySortKey === 'date') {
        this.commonFunctions.sortArrayOfObjectsNumerically(childItems, secondarySortKey, 'asc');
      } else if (secondarySortKey) {
        this.commonFunctions.sortArrayOfObjectsAlphabetically(childItems, secondarySortKey);
      }
    }

    if (categoricalMenu.length > 0) {
      categoricalMenu[categoricalMenu.length - 1].children = childItems;
    } else {
      categoricalMenu[0] = {};
      categoricalMenu[0].children = childItems;
    }

    return categoricalMenu;
  }

  setActiveMenuSorting(event: any) {
    if (this.activeMenuSorting !== event.detail.value) {
      this.activeMenuSorting = event.detail.value;
      this.tocService.setActiveTocOrder(event.detail.value);
      this.selectedMenu = [];

      if (this.activeMenuSorting === 'alphabetical') {
        this.collectionMenu = this.alphabeticalMenu;
      } else if (this.activeMenuSorting === 'chronological') {
        this.collectionMenu = this.chronologicalMenu;
      } else if (this.activeMenuSorting === 'categorical') {
        this.collectionMenu = this.categoricalMenu;
      } else {
        this.collectionMenu = this.defaultMenu;
      }

      this.recursiveInitializeSelectedMenu(this.collectionMenu);
      this.updateHighlightedMenuItem(800);
    }
  }

}
