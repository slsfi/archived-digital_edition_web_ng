export class Facsimile {
  public id: number;
  public zoom: number;
  public page: number;
  public pages: number;
  public pre_page_count: number;
  public page_nr: number;
  public itemId: string;
  public manuscript_id: number;
  public publication_facsimile_collection_id: number;
  public facsimile_id: number;
  public number_of_pages: number;
  public priority: number;

  public title: any;
  public content = '';
  public images: any = [];
  public zoomedImages: any = [];

  public type: number;

  constructor(facsimileInfo: any) {
    this.id = facsimileInfo.id;
    this.zoom = 1;
    this.page = facsimileInfo.start_page_number + facsimileInfo.page_nr;
    this.page_nr = facsimileInfo.page_nr;
    this.pages = facsimileInfo.pages;
    this.pre_page_count = facsimileInfo.start_page_number;
    this.type = facsimileInfo.type;
    this.title = facsimileInfo.title;
    this.itemId = facsimileInfo.itemId;
    this.manuscript_id = facsimileInfo.manuscript_id;
    this.publication_facsimile_collection_id = facsimileInfo.publication_facsimile_collection_id;
    this.facsimile_id = facsimileInfo.publication_facsimile_id;
    this.number_of_pages = facsimileInfo.number_of_pages;
    this.priority = facsimileInfo.priority;
  }
}
