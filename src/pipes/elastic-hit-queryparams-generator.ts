import { Pipe, PipeTransform } from '@angular/core';

import { UrlService } from 'src/app/services/url.service';
import { config } from 'src/assets/config/config';


@Pipe({
  name: 'elasticHitQueryParamsGenerator',
  standalone: true
})
export class ElasticHitQueryParamsGeneratorPipe implements PipeTransform {
  openEstWithComTypeHit: boolean = false;

  constructor(private urlService: UrlService) {
    this.openEstWithComTypeHit = config.ElasticSearch?.openEstWithComTypeHit ?? false;
  }

  transform(elasticHit: any): any {
    let text_type = elasticHit?.source?.text_type ?? '';
    const views: any[] = [];

    if (
      text_type === 'est' ||
      text_type === 'com' ||
      text_type === 'var' ||
      text_type === 'ms'
    ) {
      text_type = text_type === 'est' ? 'established'
            : text_type === 'com' ? 'comments'
            : text_type === 'var' ? 'variants'
            : 'manuscripts'

      let type_id = elasticHit?.source?.type_id ?? null;
      if (type_id) {
        type_id = parseInt(type_id);
      }

      if (text_type === 'comments' && this.openEstWithComTypeHit) {
        views.push(
          {
            type: 'established'
          }
        );
      }

      views.push(
        {
          type: text_type,
          ...(type_id && { id: type_id })
        }
      );
    }

    const params: any = {
      views: views.length ? this.urlService.stringify(views, true) : null
    }

    return params;
  }
}
