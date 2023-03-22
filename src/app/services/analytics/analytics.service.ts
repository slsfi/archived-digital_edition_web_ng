import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { isBrowser } from 'src/standalone/utility-functions';


@Injectable()
export class AnalyticsService {

  constructor(public http: HttpClient) {
  }

  public doAnalyticsEvent( category: any, type: any, action: any ) {
    if (isBrowser()) {
      const path = String(document.URL).split('#')[-1];
      try {
        (<any>window).gtag('event', action, {
          'event_category': category,
          'event_label': type,
          'event_action': action,
          'page_path': path
        });
      } catch ( e ) {
        // Fallback to UA Google Analytics
        this.doAnalyticsEventUA(category, type, action);
      }
    }
  }

  public doPageView(title: any, location?: any, path?: any) {
    if (isBrowser()) {
      if ( !location ) {
        location = '';
      }
      if ( !path ) {
        path = String(document.URL).split('#')[-1];
      }
      try {
        (<any>window).gtag('event', 'page_view', {
          page_title: title,
          page_location: location,
          page_path: path
        })
      } catch ( e ) {
        // Fallback to UA Google Analytics
        this.doPageViewUA(title, location, path);
      }
    }
  }

  public doAnalyticsEventUA( category: any, type: any, action: any ) {
    if (isBrowser()) {
      try {
        (<any>window).ga('send', 'event', {
          eventCategory: category,
          eventLabel: type,
          eventAction: action,
          eventValue: 10
        });
      } catch ( e ) {
      }
    }
  }

  public doPageViewUA(title: any, location?: any, path?: any) {
    if (isBrowser()) {
      if ( !location ) {
        location = '';
      }
      if ( !path ) {
        path = '';
      }
      try {
        (<any>window).ga('set', 'page', title);
        (<any>window).ga('send', 'pageview');
      } catch ( e ) {
      }
    }
  }

}
