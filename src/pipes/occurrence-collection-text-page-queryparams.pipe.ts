import { Pipe, PipeTransform } from '@angular/core';


@Pipe({
    name: 'occurrenceCollectionTextPageQueryparams',
    standalone: true
})
export class OccurrenceCollectionTextPageQueryparamsPipe implements PipeTransform {
    transform(textData: any): any {
        let text_type = '';
        let viewTypeID = '';
        let facsNr = '';

        if (textData.textType === 'ms') {
            text_type = 'manuscripts';
            viewTypeID = textData.publication_manuscript_id;
        } else if (textData.textType === 'var') {
            text_type = 'variants';
            viewTypeID = textData.publication_version_id;
        } else if (textData.textType === 'facs') {
            text_type = 'facsimiles'
            viewTypeID = textData.publication_facsimile_id
            facsNr = textData.facsimilePage;
        } else if (textData.textType === 'est') {
            text_type = 'established'
        } else {
            text_type = 'comments';
        }

        const params: any = {
            views: '(type:' + text_type + (viewTypeID ? ',id:' + viewTypeID : '') + (facsNr ? ',nr:' + facsNr : '') + ')'
        };

        return params;
    }
}
