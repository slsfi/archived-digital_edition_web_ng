import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';


@Component({
  selector: 'page-ebook',
  templateUrl: 'ebook.html',
  styleUrls: ['ebook.scss'],
})

export class EbookPage implements OnInit {
  epubFileName: string = '';

  constructor(
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.epubFileName = params['epubFileName'];
    });
  }

}
