import { Pipe, PipeTransform } from '@angular/core';
import { config } from "src/app/services/config/config";

/**
 * Generated class for the SortPipe pipe.
 *
 * See https://angular.io/api/core/Pipe for more info on Angular Pipes.
 */
@Pipe({
  name: 'initialPathGenerator',
})
export class InitialPathGeneratorPipe implements PipeTransform {
  transform(parentPath: string, childId: string): string {
    if (parentPath === '/publication') {
      if (config.HasCover) {
        return `${parentPath}/${childId}/cover`;
      } else if (config.HasTitle) {
        return `${parentPath}/${childId}/title`;
      } else if (config.HasForeword) {
        return `${parentPath}/${childId}/foreword`;
      } else if (config.HasIntro) {
        return `${parentPath}/${childId}/introduction`;
      } else if (config.collections?.firstReadItem) {
        const idPath = config.collections.firstReadItem[childId]?.split('_') || [];
        if (idPath.length) {
          idPath[0] = 'text';
        }
        return `/publication/${childId}/${idPath.join('/')}`;
      }
      return '';
    } else {
      return childId === 'media-collections' ? `/media-collections` : `${parentPath}/${childId}`
    }
  }
}


@Pipe({
  name: 'publicationPathGenerator'
})
export class PublicationPathGenerator implements PipeTransform {
  transform(collectionId: string, typeOfPage?: string): any {
    switch (typeOfPage) {
      case 'cover':
        return `/publication/${collectionId}/cover`;
      case 'title':
        return `/publication/${collectionId}/title`;
      case 'foreword':
        return `/publication/${collectionId}/foreword`;
      case 'introduction':
        return `/publication/${collectionId}/introduction`;
      default:
        return `/publication/${collectionId}/text`;
    }
  }
}

@Pipe({
  name: 'pagePathGenerator'
})
export class PagePathGenerator implements PipeTransform {
  transform(itemId: string): any {
    const idList = itemId.split('_');
    let url = `/publication/${idList[0]}/text/${idList[1]}`;
    if(idList.length === 3) {
      const chapterList = idList[2].split(';')
      url += `/${chapterList[0]}`
    }
    else
      url += '/nochapter'
    return url;
  }
}

@Pipe({
  name: 'positionParamGenerator'
})
export class PositionParamGenerator implements PipeTransform {
  transform(itemId: string): any {
    const idList = itemId.split('_');

    if(idList.length === 3) {
      const chapterList = idList[2].split(';')
      if(chapterList[1]){
        return {
          position: chapterList[1]
        }
      }
    }
    return;
  }
}
