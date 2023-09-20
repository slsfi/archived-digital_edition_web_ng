import { Pipe, PipeTransform } from '@angular/core';


@Pipe({
    name: 'collectionPagePath',
    standalone: true
})
export class CollectionPagePathPipe implements PipeTransform {
    transform(itemId: string, typeOfPage?: string): any {
        switch (typeOfPage) {
            case 'cover':
                return `/collection/${itemId}/cover`;
            case 'title':
                return `/collection/${itemId}/title`;
            case 'foreword':
                return `/collection/${itemId}/foreword`;
            case 'introduction':
                return `/collection/${itemId}/introduction`;
            default:
                const idList = itemId.split('_');
                if (idList.length > 1) {
                    let url = `/collection/${idList[0]}/text/${idList[1]}`;
                    if (idList.length > 2) {
                        const chapter = idList[2].split(';')[0];
                        url += `/${chapter}`;
                    }
                    return url;
                } else {
                    return '';
                }
        }
    }
}
