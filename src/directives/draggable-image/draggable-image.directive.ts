import { Directive, ElementRef, EventEmitter, HostListener, Input, NgZone, Output, Renderer2 } from '@angular/core';

@Directive({
    standalone: true,
    selector: '[draggableImage]'
})
export class DraggableImageDirective {
    @Input('draggableImage') initialCoordinates: number[] = [0, 0];
    @Input() angle: number = 0;
    @Input() zoom: number = 1;
    @Output() finalCoordinates = new EventEmitter<number[]>();

    private activeDrag: boolean = false;
    private offsetX: number = 0;
    private offsetY: number = 0;

    constructor(
        private elRef: ElementRef,
        private ngZone: NgZone,
        private renderer: Renderer2
    ) {}

    @HostListener('mousedown', ['$event']) onMouseDown(event: any) {
        this.startDrag(event);
    }
    @HostListener('mousemove', ['$event']) onMouseMove(event: any) {
        this.dragElement(event);
    }
    @HostListener('mouseup', ['$event']) onMouseUp(event: any) {
        this.stopDrag(event);
    }
    @HostListener('touchstart', ['$event']) onTouchStart(event: any) {
        this.startDrag(event);
    }
    @HostListener('touchmove', ['$event']) onTouchMove(event: any) {
        this.dragElement(event);
    }
    @HostListener('touchend', ['$event']) onTouchEnd(event: any) {
        this.stopDrag(event);
    }

    private startDrag(event: any) {
        if (!this.activeDrag) {
            if (event.preventDefault) {
                event.preventDefault();
            }

            if (event.type === 'touchstart') {
                this.offsetX = event.touches[0].clientX;
                this.offsetY = event.touches[0].clientY;
            } else {
                this.offsetX = event.clientX;
                this.offsetY = event.clientY;
            }

            this.activeDrag = true;
        }
    }

    private dragElement(event: any) {
        if (this.activeDrag) {
            this.ngZone.runOutsideAngular(() => {
                const newCoordinates = this.calculateCoordinates(event);
                if (this.elRef.nativeElement) {
                    this.renderer.setStyle(
                        this.elRef.nativeElement,
                        'transform', 'scale('+this.zoom+') translate3d('+newCoordinates[0]+'px, '+newCoordinates[1]+'px, 0px) rotate('+this.angle+'deg)'
                    );
                }
            });
        }
    }
    
    private stopDrag(event: any) {
        if (this.activeDrag) {
            this.activeDrag = false;
            const newCoordinates = this.calculateCoordinates(event);
            this.finalCoordinates.emit([newCoordinates[0], newCoordinates[1]]);
        }
    }

    private calculateCoordinates(event: any) {
        let x = 0;
        let y = 0;
        let deltaX = 0;
        let deltaY = 0;

        if (event.type === "touchmove" || event.type === "touchend") {
            deltaX = event.touches[0].clientX - this.offsetX;
            deltaY = event.touches[0].clientY - this.offsetY;
        } else {
            deltaX = event.clientX - this.offsetX;
            deltaY = event.clientY - this.offsetY;
        }

        x = this.initialCoordinates[0] + deltaX / this.zoom;
        y = this.initialCoordinates[1] + deltaY / this.zoom;

        return [x, y];
    }
}
