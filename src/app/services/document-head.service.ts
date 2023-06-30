import { Inject, Injectable, LOCALE_ID, Renderer2, RendererFactory2 } from '@angular/core';
import { DOCUMENT } from "@angular/common";
import { Meta, Title } from "@angular/platform-browser";

import { config } from "src/assets/config/config";


@Injectable({
  providedIn: 'root',
})
export class DocumentHeadService {
    private currentRouterUrl: string | undefined = undefined;
    private languages: any[] = [];
    private renderer: Renderer2;

    constructor(
        private meta: Meta,
        private rendererFactory: RendererFactory2,
        private title: Title,
        @Inject(LOCALE_ID) private activeLocale: string,
        @Inject(DOCUMENT) private document: Document
    ) {
        this.renderer = this.rendererFactory.createRenderer(null, null);
        this.languages = config.app?.i18n?.languages ?? [];
    }

    setTitle(pageTitleParts: string[] = []) {
        let pageTitle = '';
        for (let i = 0; i < pageTitleParts.length; i++) {
            if (pageTitleParts[i]) {
                if (pageTitleParts[i].at(-1) === '.') {
                    pageTitleParts[i] = pageTitleParts[i].slice(0, -1);
                }
                pageTitle = i > 0 ? pageTitle + ' - ' + pageTitleParts[i]
                    : pageTitleParts[i];
            }
        }
    
        pageTitle = pageTitle ? pageTitle + ' - ' + $localize`:@@Site.Title:Webbplatsens titel`
            : $localize`:@@Site.Title:Webbplatsens titel`;

        this.title.setTitle(pageTitle);
    }

    setMetaProperty(name: string, content: string) {
        if (content) {
            this.meta.updateTag({
                name: name, 
                content: content
            });
        } else {
            this.meta.removeTag('name=' + name);
        }
    }

    setLinks(routerURL: string) {
        routerURL = this.canonicalizeURL(routerURL);
        if (routerURL !== this.currentRouterUrl) {
            this.currentRouterUrl = routerURL;

            const x_default = config.app?.i18n?.defaultLanguage
                    ? config.app.i18n.defaultLanguage
                    : this.languages[0].code;

            // Remove old tags
            this.removeLinkTags('canonical');
            this.removeLinkTags('alternate', true);

            // Add new canonical link tag
            this.addLinkTag('canonical', x_default, routerURL);

            // Add new hreflang link tags
            if (this.languages.length > 1) {
                this.languages.forEach(language => {
                    this.addLinkTag('alternate', language.code, routerURL, true);
                });
                
                this.addLinkTag('alternate', x_default, routerURL, true, true);
            }
        }
    }

    addLinkTag(relType: string, locale: string, routerURL: string, hreflang: boolean = false, x_default: boolean = false) {
        const tag: HTMLLinkElement = this.renderer.createElement('link');
        this.renderer.setAttribute(tag, 'rel', relType);
        if (hreflang) {
            !x_default && this.renderer.setAttribute(tag, 'hreflang', locale);
            x_default && this.renderer.setAttribute(tag, 'hreflang', 'x-default');
        }
        this.renderer.setAttribute(tag, 'href', this.getAbsoluteURL(locale + routerURL));
        this.renderer.appendChild(this.document.head, tag);
    }

    removeLinkTags(relType: string, hreflang: boolean = false) {
        const hreflangAttr = hreflang ? '[hreflang]' : '';
        const linkTags = this.document.head.querySelectorAll('link[rel="' + relType + '"]' + hreflangAttr);
        for (let i = 0; i < linkTags.length; i++) {
            this.renderer.removeChild(this.document.head, linkTags[i]);
        }
    }

    getAbsoluteURL(relativeURL: string) {
        return String(this.document.defaultView?.location.origin) + '/' + relativeURL;
    }

    canonicalizeURL(url: string): string {
        return url.split('?')[0];
    }
    
}
