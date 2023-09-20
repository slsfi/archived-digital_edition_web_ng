import { Pipe, PipeTransform } from '@angular/core';

import { config } from 'src/assets/config/config';


@Pipe({
    name: 'parentChildPagePath',
    standalone: true
})
export class ParentChildPagePathPipe implements PipeTransform {
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
