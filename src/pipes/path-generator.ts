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
      if(config.HasCover) {
        return `${parentPath}/${childId}/cover`
      } else if (config.HasTitle) {
        return `${parentPath}/${childId}/title`
      } else if (config.HasForeword) {
        return `${parentPath}/${childId}/foreword`
      } else if (config.HasIntro) {
        return `${parentPath}/${childId}/introduction`
      } else {
        //TODO: thanh - path for when all conditions fail
        return ''
      }
    } else {
      return childId === 'media-collections' ? `/media-collections` : `${parentPath}/${childId}`
    }
  }
}
