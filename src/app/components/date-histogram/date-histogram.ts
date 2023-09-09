import { Component, Input, OnChanges } from '@angular/core'
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';


/**
 * Visualize and select time ranges using elastic search date histogram data.
 *
 * TODO: Add drag to select range.
 * TODO: Add more granular months selection.
 */
@Component({
  standalone: true,
  selector: 'date-histogram',
  templateUrl: 'date-histogram.html',
  styleUrls: ['date-histogram.scss'],
  imports: [CommonModule, FormsModule, IonicModule]
})
export class DateHistogram implements OnChanges {
  @Input() years?: [any] = undefined;
  @Input() yearsAll?: [any] = undefined;
  @Input() change?: Function = undefined;
  @Input() selectedRange?: any = undefined;

  from?: string = undefined;
  to?: string = undefined;
  max: number = 0;
  firstYear?: string = undefined;
  lastYear?: string = undefined;
  firstUpdate: boolean = true;

  constructor() {}

  ngOnChanges() {
    this.updateMax();
    this.updateData();
  }

  private updateMax() {
    this.max = this.years?.reduce(function (current, year) {
      return Math.max(current, year.doc_count)
    }, 0) || 0;
  }

  private updateData() {
    if (this.yearsAll && this.years) {
      if (this.firstUpdate) {
        this.firstUpdate = false;

        if (this.yearsAll.length) {
          this.firstYear = this.yearsAll[0]['key_as_string'];
          this.lastYear = this.yearsAll[this.yearsAll.length - 1]['key_as_string'];

          let first = Number(this.yearsAll[0]['key_as_string']);
          while (first % 10 !== 0) {
            first = first - 1;
            this.yearsAll.unshift(
              {
                key: new Date(String(first)).getTime(),
                key_as_string: String(first),
                doc_count: 0
              }
            );
          }

          let last = Number(this.yearsAll[this.yearsAll.length - 1]['key_as_string']);
          while (last % 10 !== 0) {
            last = last + 1;
            this.yearsAll.push(
              {
                key: new Date(String(last)).getTime(),
                key_as_string: String(last),
                doc_count: 0
              }
            );
          }
        }
        // console.log('yearsAll', this.yearsAll);
      } else if (this.selectedRange?.from && this.selectedRange?.to) {
        // console.log(this.selectedRange);
        this.from = this.selectedRange?.from;
        this.to = this.selectedRange?.to;
      }

      // console.log('years', this.years);

      for (let a = 0; a < this.yearsAll.length; a++) {
        this.yearsAll[a]['doc_count_current'] = 0;
        for (let y = 0; y < this.years.length; y++) {
          if (this.yearsAll[a]['key_as_string'] === this.years[y]['key_as_string']) {
            this.yearsAll[a]['doc_count_current'] = this.years[y]['doc_count'];
            break;
          }
        }
      }
    }
  }

  reset() {
    this.from = undefined;
    this.to = undefined;
    this.change?.(null, null);
  }

  // Send the change event to the parent component
  onChange() {
    const fromTime = new Date(this.from || '').getTime();
    // Add one year to get the full year.
    const toTime = new Date(`${parseInt(this.to || '') + 1}`).getTime();

    if (fromTime <= toTime) {
      this.change?.(this.from, this.to);
    }
  }

  getYearRelativeToMax(year: any) {
    return `${Math.floor(year.doc_count_current / this.max * 100)}%`;
  }

  isDecade(year: any) {
    return parseInt(year.key_as_string || '') % 10 === 0;
  }

  selectYear(selected: any) {
    this.selectedRange = undefined;
    if (!this.from) {
      this.from = selected.key_as_string;
    } else if (!this.to && parseInt(selected.key_as_string || '') >= parseInt(this.from)) {
      this.to = selected.key_as_string;
    } else {
      this.from = selected.key_as_string;
      this.to = undefined;
    }

    if (this.from && this.to) {
      this.onChange();
    }
  }

  isYearInRange(year: any) {
    const yearNumber = parseInt(year.key_as_string || '');
    if (year.key_as_string === this.from || year.key_as_string === this.to) {
      return true;
    } else if (this.from && this.to) {
      return yearNumber >= parseInt(this.from) && yearNumber <= parseInt(this.to);
    } else {
      return false;
    }
  }

  updateYearFrom(event: any) {
    if (event?.detail?.value) {
      this.selectedRange = undefined;
      if (!this.to || this.to && parseInt(event?.detail?.value) > parseInt(this.to || '')) {
        this.from = event?.detail?.value;
        this.to = undefined;
      } else {
        this.from = event?.detail?.value;
        this.onChange();
      }
    }
  }

  updateYearTo(event: any) {
    if (event?.detail?.value) {
      this.selectedRange = undefined;
      if (!this.from || this.from && parseInt(event?.detail?.value) < parseInt(this.from || '')) {
        this.to = event?.detail?.value;
        this.from = undefined;
      } else {
        this.to = event?.detail?.value;
        this.onChange();
      }
    }
  }

}
