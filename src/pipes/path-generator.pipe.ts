import { Pipe, PipeTransform } from '@angular/core';
import { config } from "src/assets/config/config";


@Pipe({
  name: 'initialPathGenerator',
})
export class InitialPathGeneratorPipe implements PipeTransform {
  transform(parentPath: string, childId: string): string {
    if (parentPath === '/collection') {
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
        return `/collection/${childId}/${idPath.join('/')}`;
      }
      return '';
    } else {
      return childId ? `${parentPath}/${childId}` : `${parentPath}`
    }
  }
}


@Pipe({
  name: 'collectionPathGenerator'
})
export class CollectionPathGeneratorPipe implements PipeTransform {
  transform(collectionId: string, typeOfPage?: string): any {
    switch (typeOfPage) {
      case 'cover':
        return `/collection/${collectionId}/cover`;
      case 'title':
        return `/collection/${collectionId}/title`;
      case 'foreword':
        return `/collection/${collectionId}/foreword`;
      case 'introduction':
        return `/collection/${collectionId}/introduction`;
      default:
        return `/collection/${collectionId}/text`;
    }
  }
}


@Pipe({
  name: 'pagePathGenerator'
})
export class PagePathGeneratorPipe implements PipeTransform {
  transform(itemId: string): any {
    const idList = itemId.split('_');
    let url = `/collection/${idList[0]}/text/${idList[1]}`;
    if (idList.length > 2) {
      const chapter = idList[2].split(';')[0];
      url += `/${chapter}`;
    }
    return url;
  }
}


@Pipe({
  name: 'positionParamGenerator'
})
export class PositionParamGeneratorPipe implements PipeTransform {
  transform(itemId: string): any {
    const idList = itemId.split(';');
    if (idList.length > 1) {
      return {
        position: idList[1]
      }
    }
    return;
  }
}
