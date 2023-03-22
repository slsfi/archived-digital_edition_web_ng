import { Pipe, PipeTransform } from '@angular/core';
import { config } from "src/app/services/config/config";

/**
 * Generated class for the SortPipe pipe.
 *
 * See https://angular.io/api/core/Pipe for more info on Angular Pipes.
 */
@Pipe({
  name: 'pathGenerator',
})
export class PathGenerator implements PipeTransform {
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
