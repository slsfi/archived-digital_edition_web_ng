
export class DigitalEdition {
  title: string;
  id: string;
  image?: string;
  divchapters: boolean;
  url: string;
  isDownload: boolean;
  expanded: boolean;
  isDownloadOnly?: boolean;
  type: string;

  constructor(pubInfo: any) {
    this.title = pubInfo.title;
    this.id = pubInfo.id;
    this.divchapters = (pubInfo.divchapters === '1');
    this.url = pubInfo.url;
    this.isDownload = pubInfo.isDownload;
    this.expanded = pubInfo.expanded;
    this.isDownloadOnly = pubInfo.isDownloadOnly || false;
    this.type = pubInfo.type || (pubInfo.epub ? 'ebook' : null) || (pubInfo.pdf ? 'pdf' : null) || 'collection';
  }
}
