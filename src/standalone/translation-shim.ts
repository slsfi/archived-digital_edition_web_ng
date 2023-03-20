import {of} from "rxjs";

export function this_translate_get(key: string) {
  return of($localize`@@${key}`);
}

export function this_translateService_get(key: string) {
  return of($localize`:@@${key}`);
}
