import {TranslateLoader} from "@ngx-translate/core";
import {of} from "rxjs";

export class CustomTranslateHttpLoader implements TranslateLoader {
  constructor(... args: any[]) {}

  public getTranslation(lang: string) {
    return of({});
  }
}
