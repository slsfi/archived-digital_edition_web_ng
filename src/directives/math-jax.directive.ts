import { Directive, ElementRef, Input, OnChanges, SecurityContext } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

declare var MathJax: {
  Hub: {
    Queue: (param: Object[]) => void
  }
}

@Directive({
  standalone: true,
  selector: '[MathJax]'
})
export class MathJaxDirective implements OnChanges {
  @Input('MathJax') MathJaxInput: string | SafeHtml | null = null;

  constructor(
    private elRef: ElementRef,
    private sanitizer: DomSanitizer
  ) {}

  ngOnChanges() {
    if (this.MathJaxInput) {
      this.elRef.nativeElement.innerHTML = this.sanitizer.sanitize(SecurityContext.HTML, this.MathJaxInput);
      try {
        MathJax.Hub.Queue(['Typeset', MathJax.Hub, this.elRef.nativeElement]);
      } catch (e) {
      }
    }
  }

}
