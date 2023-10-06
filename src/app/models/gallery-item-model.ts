export class GalleryItem {
    collectionID: number;
    description?: string;
    id: number | string;
    imageAltText?: string;
    imageURL: string;
    imageURLThumb?: string;
    imageURLBack?: string;
    sortOrder?: number;
    subItemCount?: number;
    subTitle?: string;
    title?: string;

    constructor(obj: any) {
        this.collectionID = obj.collection_id || obj.id;
        this.description = obj.description || undefined;
        this.id = obj.id ? obj.id : (obj.collection_id && obj.front ? String(obj.collection_id) + '_' + obj.front : '');
        this.imageURL = obj.imageURL || obj.front;
        this.imageURLThumb = this.imageURL;
        this.imageURLBack = obj.imageURLBack || obj.back || undefined;
        this.sortOrder = obj.sortOrder || obj.sort_order || undefined;
        this.subItemCount = obj.subItemCount || obj.media_count || undefined;
        this.title = (obj.front ? obj.media_title_translation : obj.title) || undefined;
        this.subTitle = obj.subTitle || obj.subject_name || undefined;
        this.imageAltText = obj.imageAltText || this.title;
    }
}
