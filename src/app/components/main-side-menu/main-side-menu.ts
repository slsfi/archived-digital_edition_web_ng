import { Component, Inject, Input, LOCALE_ID, OnChanges, OnInit } from '@angular/core';
import { UrlSegment } from "@angular/router";
import { catchError, forkJoin, map, Observable, of } from 'rxjs';

import { CommonFunctionsService } from "src/app/services/common-functions.service";
import { DocumentHeadService } from 'src/app/services/document-head.service';
import { DigitalEditionListService } from "src/app/services/digital-edition-list.service";
import { GalleryService } from "src/app/services/gallery.service";
import { MdContentService } from "src/app/services/md-content.service";
import { config } from "src/assets/config/config";


@Component({
  selector: 'main-side-menu',
  templateUrl: './main-side-menu.html',
  styleUrls: ['./main-side-menu.scss'],
})
export class MainSideMenu implements OnInit, OnChanges {
  @Input() urlSegments: UrlSegment[] = [];

  _config = config;
  aboutPagesRootNodeID: string = '';
  epubsList: any[] = [];
  highlightedMenu: string = '';
  mainMenu: any[] = [];
  selectedMenu: string[] = [];
  topMenuItems: string[] = [
    '/',
    '/content',
    '/search'
  ]; // app.component handles setting html-title for these

  constructor(
    private commonFunctions: CommonFunctionsService,
    private headService: DocumentHeadService,
    private mdcontentService: MdContentService,
    private digitalEditionListService: DigitalEditionListService,
    private galleryService: GalleryService,
    @Inject(LOCALE_ID) public activeLocale: string
  ) {
    this.aboutPagesRootNodeID = this._config.page?.about?.markdownFolderNumber ?? '03';
    this.epubsList = this._config.AvailableEpubs ?? [];

    if (this.epubsList) {
      this.epubsList.forEach((epub: any) => {
        epub.id = epub.filename;
      });
    }
  }

  ngOnInit() {
    this.getMenuData().subscribe({
      next: (menu: any[]) => {
        this.mainMenu = menu;
        this.updateHighlightedMenuItem();
      }
    });
  }

  ngOnChanges() {
    if (this.mainMenu?.length) {
      this.updateHighlightedMenuItem();
    }
  }

  private getMenuData(): Observable<any> {
    // The order of the functions in the array which is fed to forkJoin
    // determines the order of the menu items in the menu.
    return forkJoin(
      [
        this.getHomePageMenuItem(),
        this.getAboutPagesMenu(),
        this.getEbookPagesMenu(),
        this.getCollectionPagesMenu(),
        this.getMediaCollectionPagesMenu(),
        this.getPersonsPageMenuItem(),
        this.getPlacesPageMenuItem(),
        this.getKeywordsPageMenuItem(),
        this.getWorksPageMenuItem()
      ]
    ).pipe(
      map((res: any[]) => {
        let menu: any[] = [];

        // Filter out menu groups that have no data, i.e. are not supposed
        // to be in the menu according to the config.
        for (let i = 0; i < res.length; i++) {
          if (res[i].menuData && res[i].menuData.length) {
            for (let x = 0; x < res[i].menuData.length; x++) {
              menu.push(res[i].menuData[x]);
            }
          }
        }

        // Add unique ids to each node in the menu.
        this.recursiveAddNodeIdsToMenu(menu);
        return menu;
      })
    );
  }

  private getHomePageMenuItem(): Observable<any> {
    let menuData: any[] = [];
    if (this._config.show?.TOC?.Home) {
      menuData = [{ id: '', title: $localize`:@@TOC.Home:Hem`, parentPath: '/' }];
    }
    return of({ menuType: 'home', menuData });
  }

  private getAboutPagesMenu(): Observable<any> {
    if (this._config.show?.TOC?.About) {
      return this.mdcontentService.getMarkdownMenu(
        this.activeLocale, this.aboutPagesRootNodeID
      ).pipe(
        map((res: any) => {
          res = [res];
          this.recursivelyAddParentPagePath(res, '/about');
          return { menuType: 'about', menuData: res };
        }),
        catchError((error: any) => {
          console.error(error);
          return of({ menuType: 'about', menuData: [] });
        })
      );
    } else {
      return of({ menuType: 'about', menuData: [] });
    }
  }

  private getEbookPagesMenu(): Observable<any> {
    let menuData: any[] = [];
    if (this._config.show?.TOC?.EPUB && this.epubsList?.length) {
      this.epubsList.forEach(epub => {
        menuData.push({
          id: epub.id,
          title: epub.title,
          parentPath: '/ebook'
        });
      });
      if (this.epubsList.length > 1) {
        menuData = [{
          title: $localize`:@@TOC.Ebooks:E-böcker`,
          children: menuData
        }];
      }
    }
    return of({ menuType: 'ebook', menuData });
  }

  private getCollectionPagesMenu(): Observable<any> {
    if (this._config.collections?.order?.length) {
      return this.digitalEditionListService.getDigitalEditions().pipe(
        map((res: any) => {
          this.recursivelyAddParentPagePath(res, '/collection');
          res = this.categorizeCollections(res);
          let menu = [];
          for (let i = 0; i < res.length; i++) {
            let title = $localize`:@@TOC.Read:Innehåll`;
            if (i > 0) {
              i === 1 ? title = $localize`:@@TOC.Read1:Innehåll 2`
              : i === 2 ? title = $localize`:@@TOC.Read2:Innehåll 3`
              : i === 3 ? title = $localize`:@@TOC.Read3:Innehåll 4`
              : i === 4 ? title = $localize`:@@TOC.Read4:Innehåll 5`
              : title = 'Error: out of category translations';
            }
            menu.push({ title, children: res[i] });
          }
          return { menuType: 'collection', menuData: menu };
        }),
        catchError((error: any) => {
          console.error(error);
          return of({ menuType: 'collection', menuData: [] });
        })
      );
    } else {
      return of({ menuType: 'collection', menuData: [] });
    }
  }

  private getMediaCollectionPagesMenu(): Observable<any> {
    if (this._config.show?.TOC?.MediaCollections) {
      return this.galleryService.getGalleries(this.activeLocale).pipe(
        map((res: any) => {
          if (res && res.length > 0) {
            this.commonFunctions.sortArrayOfObjectsAlphabetically(res, 'title');
            this.recursivelyAddParentPagePath(res, '/media-collection');
            res.unshift({ id: '', title: $localize`:@@TOC.All:Alla`, parentPath: '/media-collections' });
            res = [{ title: $localize`:@@TOC.MediaCollections:Bildbank`, children: res }];
          } else {
            res = [];
          }
          return { menuType: 'media-collections', menuData: res };
        }),
        catchError((error: any) => {
          console.error(error);
          return of({ menuType: 'media-collections', menuData: [] });
        })
      );
    } else {
      return of({ menuType: 'media-collections', menuData: [] });
    }
  }

  private getPersonsPageMenuItem(): Observable<any> {
    let menuData: any[] = [];
    if (this._config.show?.TOC?.PersonSearch) {
      menuData = [{ id: '', title: $localize`:@@TOC.PersonSearch:Personregister`, parentPath: '/persons' }];
    }
    return of({ menuType: 'persons', menuData });
  }

  private getPlacesPageMenuItem(): Observable<any> {
    let menuData: any[] = [];
    if (this._config.show?.TOC?.PlaceSearch) {
      menuData = [{ id: '', title: $localize`:@@TOC.PlaceSearch:Ortregister`, parentPath: '/places' }];
    }
    return of({ menuType: 'places', menuData });
  }

  private getKeywordsPageMenuItem(): Observable<any> {
    let menuData: any[] = [];
    if (this._config.show?.TOC?.TagSearch) {
      menuData = [{ id: '', title: $localize`:@@TOC.TagSearch:Ämnesord`, parentPath: '/keywords' }];
    }
    return of({ menuType: 'keywords', menuData });
  }

  private getWorksPageMenuItem(): Observable<any> {
    let menuData: any[] = [];
    if (this._config.show?.TOC?.WorkSearch) {
      menuData = [{ id: '', title: $localize`:@@TOC.WorkSearch:Verkregister`, parentPath: '/works' }];
    }
    return of({ menuType: 'works', menuData });
  }

  private categorizeCollections(collections: any) {
    if (this._config.collections?.order) {
      let collectionsList = this._config.collections.order.map(() => []);

      this._config.collections.order.forEach((array: number[], index: number) => {
        array.forEach((item: number) => {
          const collectionIndex = collections.findIndex((collection: any) => collection.id === item);
          if (collectionIndex > -1) {
            collectionsList[index].push(collections[collectionIndex]);
            //reduce the size of collections for the next iteration
            collections.splice(collectionIndex, 1);
          }
        });
      });
      return collectionsList;
    } else {
      return collections;
    }
  }

  /**
   * Goes through every object in @param array, including nested objects declared
   * as in 'children' properties, and adds a new property 'parentPath'
   * with the value of @param parentPath.
   */
  private recursivelyAddParentPagePath(array: any[], parentPath: string) {
    for (let i = 0; i < array.length; i++) {
      array[i]["parentPath"] = parentPath;
      if (array[i]["children"] && array[i]["children"].length) {
        this.recursivelyAddParentPagePath(array[i]["children"], parentPath);
      }
    }
  }

  /**
   * Recursively add nodeId property to each object in the array. nodeId is a
   * string starting with "n" and followed by running numbers. Each new branch
   * is indicated by a dash and the counter is reset. For example: n1-1-2.
   * This way each item gets a unique identifier.
   */
  private recursiveAddNodeIdsToMenu(array: any[], parentNodeId?: string) {
    for (let i = 0; i < array.length; i++) {
      array[i]["nodeId"] = (parentNodeId ? parentNodeId + '-' : 'n') + (i+1);
      if (array[i]["children"] && array[i]["children"].length) {
        this.recursiveAddNodeIdsToMenu(array[i]["children"], array[i]["nodeId"]);
      }
    }
  }

  /**
   * Based on the current page's URL segments in this.urlSegments, finds the
   * corresponding menu item, sets it as highlighted, updates the html-title
   * and expands any collapsed parents in the menu tree.
   */
  private updateHighlightedMenuItem() {
    let currentPath = this.urlSegments && this.urlSegments[0]?.path || '';
    if (currentPath && this.urlSegments && this.urlSegments[1]?.path) {
      currentPath += '/' + this.urlSegments[1]?.path;
    }
    currentPath = '/' + currentPath;
    const currentItemRoot = this.recursiveFindCurrentMenuItem(this.mainMenu, currentPath);
    if (!currentItemRoot) {
      this.highlightedMenu = '';
    }
  }

  /**
   * Used for recursively looping through the menu items and finding the current page.
   * If found, sets the highlighted menu item and html-title. Returns the root object
   * where the found item recides or undefined if not found. 
   */
  private recursiveFindCurrentMenuItem(array: any[], stringForComparison: string): any {
    return array.find(item => {
      let itemPath = item.parentPath;
      if (item.id) {
        itemPath += '/' + item.id;
      }
      if (itemPath === stringForComparison) {
        this.highlightedMenu = item.nodeId;
        if (item.parentPath === '/media-collections' || item.parentPath === '/media-collection') {
          this.headService.setTitle([String(item.title), $localize`:@@TOC.MediaCollections:Bildbank`]);
        } else if (!this.topMenuItems.includes(item.parentPath) && this.urlSegments[0]?.path !== 'collection') {
          // For top menu items the title is set by app.component, and
          // for collections the title is set by the collection side menu
          this.headService.setTitle([String(item.title)]);
        }
        return item;
      } else if (item.children) {
        const result = this.recursiveFindCurrentMenuItem(item.children, stringForComparison);
        if (result && !this.selectedMenu.includes(item.nodeId)) {
          this.selectedMenu.push(item.nodeId);
        }
        return result;
      } else {
        return undefined;
      }
    });
  }

  toggle(menuItem: any) {
    this.commonFunctions.addOrRemoveValueInArray(this.selectedMenu, menuItem.nodeId);
  }

}
