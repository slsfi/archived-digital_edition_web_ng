import { Pipe, PipeTransform } from '@angular/core';

import { UrlService } from 'src/app/services/url.service';
import { config } from 'src/assets/config/config';


@Pipe({
  name: 'elasticHitCollectionPageQueryparams',
  standalone: true
})
export class ElasticHitCollectionPageQueryparamsPipe implements PipeTransform {
  highlightSearchMatches: boolean = true;
  openEstWithComTypeHit: boolean = false;

  constructor(private urlService: UrlService) {
    this.highlightSearchMatches = config.collections?.highlightSearchMatches ?? true;
    this.openEstWithComTypeHit = config.page?.elasticSearch?.openEstWithComTypeHit ?? false;
  }

  transform(elasticHit: any): any {
    let text_type = elasticHit?.source?.text_type ?? '';
    const views: any[] = [];
    const unique_matches: string[] = [];

    // Add views to query params if est, com, var or ms text type
    if (
      text_type === 'est' ||
      text_type === 'com' ||
      text_type === 'var' ||
      text_type === 'ms'
    ) {
      let type_id = elasticHit?.source?.type_id ?? null;
      if (type_id) {
        type_id = Number(type_id);
      }

      if (text_type === 'com' && this.openEstWithComTypeHit) {
        views.push(
          {
            type: 'established'
          }
        );
      }

      views.push(
        {
          type: (
            text_type === 'est' ? 'established'
            : text_type === 'com' ? 'comments'
            : text_type === 'var' ? 'variants'
            : 'manuscripts'
          ),
          ...(type_id && { id: type_id })
        }
      );
    }

    // Add search match strings to query params
    if (
      elasticHit?.highlight?.text_data?.length &&
      this.highlightSearchMatches
    ) {
      const regexp = /<em>.+?<\/em>/g;

      elasticHit.highlight.text_data.forEach((highlight: any) => {
        const matches = highlight.match(regexp);
        matches?.forEach((match: string) => {
          const clean_match = match.replace('<em>', '').replace('</em>', '').toLowerCase();
          if (!unique_matches.includes(clean_match)) {
            unique_matches.push(clean_match);
          }
        });
      });

    }

    // Construct final query params object
    const params: any = {
      views: views.length ? this.urlService.stringify(views, true) : null,
      q: unique_matches.length ? unique_matches : null
    }

    return params;
  }
}
