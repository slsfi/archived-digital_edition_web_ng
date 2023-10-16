import { Component, ChangeDetectorRef, Input, OnChanges, OnInit, SimpleChanges, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Params, RouterLink, UrlSegment } from '@angular/router';
import { IonicModule } from '@ionic/angular';

import { CollectionPagePathPipe } from '@pipes/collection-page-path.pipe';
import { CollectionPagePositionQueryparamPipe } from '@pipes/collection-page-position-queryparam.pipe';
import { CommonFunctionsService } from '@services/common-functions.service';
import { DocumentHeadService } from '@services/document-head.service';
import { TableOfContentsService } from '@services/table-of-contents.service';
import { config } from 'src/assets/config/config';
import { addOrRemoveValueInArray, isBrowser, sortArrayOfObjectsAlphabetically, sortArrayOfObjectsNumerically } from '@utility-functions';


@Component({
  standalone: true,
  selector: 'collection-side-menu',
  templateUrl: 'collection-side-menu.html',
  styleUrls: ['collection-side-menu.scss'],
  imports: [
    CommonModule,
    IonicModule,
    RouterLink,
    CollectionPagePathPipe,
    CollectionPagePositionQueryparamPipe
  ]
})
export class CollectionSideMenu implements OnInit, OnChanges, OnDestroy {
  @Input() collectionID: string;
  @Input() initialUrlSegments: UrlSegment[];
  @Input() initialQueryParams: Params;

  _config = config;
  activeMenuSorting: string = 'default';
  alphabeticalMenu: any[] = [];
  categoricalMenu: any[] = [];
  chronologicalMenu: any[] = [];
  collectionMenu: any[] = [];
  collectionTitle: string = '';
  defaultMenu: any[] = [];
  highlightedMenu: string;
  isLoading: boolean = true;
  selectedMenu: string[] = [];
  sortOptions: string[] = [];
  sortSelectOptions: Record<string, any> = {};

  constructor(
    private cref: ChangeDetectorRef,
    private commonFunctions: CommonFunctionsService,
    private headService: DocumentHeadService,
    private tocService: TableOfContentsService
  ) {}

  ngOnInit() {
    this.loadMenu();
  }

  ngOnChanges(changes: SimpleChanges) {
    // Check if the changed input values are relevant, i.e. require the side menu to be updated.
    // If just some other queryParams than position have changed, no action is necessary in the menu.
    for (const propName in changes) {
      if (changes.hasOwnProperty(propName)) {
        if (
          propName === 'collectionID' &&
          changes.collectionID.previousValue !== changes.collectionID.currentValue
        ) {
          !changes.collectionID.firstChange && this.loadMenu();
          break;
        } else if (
          (
            propName === 'initialUrlSegments' &&
            JSON.stringify(changes.initialUrlSegments.previousValue) !== JSON.stringify(changes.initialUrlSegments.currentValue)
          ) || (
            propName === 'initialQueryParams' &&
            changes.initialQueryParams.previousValue.position !== changes.initialQueryParams.currentValue.position
          )
        ) {
          this.collectionMenu?.length && this.updateHighlightedMenuItem();
          break;
        }
      }
    }
  }

  ngOnDestroy() {
    this.tocService.setActiveTocOrder('default');
  }

  private loadMenu() {
    this.isLoading = true;
    this.collectionMenu = [];
    this.selectedMenu = [];
    this.highlightedMenu = '';
    this.sortOptions = this.setSortOptions(this.collectionID);
    this.activeMenuSorting = 'default';
    this.tocService.setActiveTocOrder('default');
  
    this.tocService.getTableOfContents(this.collectionID).subscribe({
      next: (data) => {
        if (data && data.children && data.children.length) {
          this.recursiveInitializeSelectedMenu(data.children);
          this.collectionTitle = data.text || '';
          this.collectionMenu = data.children;
          this.defaultMenu = data.children;
          this.isLoading = false;
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
              const primaryKey = this._config.component?.collectionSideMenu?.categoricalSortingPrimaryKey ?? 'date';
              const secondaryKey = this._config.component?.collectionSideMenu?.categoricalSortingSecondaryKey ?? '';
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

  private updateHighlightedMenuItem(scrollTimeout: number = 600) {
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

  private setTitleForFrontMatterPages() {
    const pageTitle = this.initialUrlSegments[2].path;
    switch (pageTitle) {
      case 'cover':
        this.headService.setTitle([$localize`:@@Read.CoverPage.Title:Omslag`, this.collectionTitle]);
        return true;
      case 'title':
        this.headService.setTitle([$localize`:@@Read.TitlePage.Title:Titelblad`, this.collectionTitle]);
        return true;
      case 'foreword':
        this.headService.setTitle([$localize`:@@Read.ForewordPage.Title:Förord`, this.collectionTitle]);
        return true;
      case 'introduction':
        this.headService.setTitle([$localize`:@@Read.Introduction.Title:Inledning`, this.collectionTitle]);
        return true;
      default:
        return false;
    }
  }

  private getItemId(): string {
    let itemId = '';
    itemId += this.initialUrlSegments[1]?.path ? `${this.initialUrlSegments[1].path}` : '';
    itemId += this.initialUrlSegments[3]?.path ? `_${this.initialUrlSegments[3].path}` : '';
    itemId += this.initialUrlSegments[4]?.path ? `_${this.initialUrlSegments[4].path}` : '';

    itemId += this.initialQueryParams.position ? `;${this.initialQueryParams.position}` : '';
    return itemId;
  }

  private recursiveFinding(array: any[], stringForComparison: string): any {
    return array.find(item => {
      if (item.itemId === stringForComparison) {
        this.headService.setTitle([String(item.text), this.collectionTitle]);
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
  private recursiveInitializeSelectedMenu(array: any[], parentNodeId?: string) {
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

  private scrollHighlightedMenuItemIntoView(itemId: string, scrollTimeout: number = 600) {
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

  private setSortOptions(collectionID: string) {
    const sortOptions: string[] = [];
    if (this._config.component?.collectionSideMenu?.sortableCollectionsAlphabetical?.includes(collectionID)) {
      sortOptions.push('alphabetical');
    }
    if (this._config.component?.collectionSideMenu?.sortableCollectionsChronological?.includes(collectionID)) {
      sortOptions.push('chronological');
    }
    if (this._config.component?.collectionSideMenu?.sortableCollectionsCategorical?.includes(collectionID)) {
      sortOptions.push('categorical');
    }
    return sortOptions;
  }

  private constructAlphabeticalMenu(flattenedMenuData: any[]) {
    const alphabeticalMenu: any[] = [];

    for (const child of flattenedMenuData) {
      if (child.itemId) {
        alphabeticalMenu.push(child);
      }
    }

    sortArrayOfObjectsAlphabetically(alphabeticalMenu, 'text');
    return alphabeticalMenu;
  }

  private constructCategoricalMenu(flattenedMenuData: any[], primarySortKey: string, secondarySortKey?: string) {
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
      sortArrayOfObjectsNumerically(orderedList, primarySortKey, 'asc');
    } else {
      sortArrayOfObjectsAlphabetically(orderedList, primarySortKey);
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
          sortArrayOfObjectsNumerically(childItems, secondarySortKey, 'asc');
        } else if (secondarySortKey) {
          sortArrayOfObjectsAlphabetically(childItems, secondarySortKey);
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
        sortArrayOfObjectsNumerically(childItems, secondarySortKey, 'asc');
      } else if (secondarySortKey) {
        sortArrayOfObjectsAlphabetically(childItems, secondarySortKey);
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

  toggle(menuItem: any) {
    addOrRemoveValueInArray(this.selectedMenu, menuItem.itemId || menuItem.nodeId);
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
