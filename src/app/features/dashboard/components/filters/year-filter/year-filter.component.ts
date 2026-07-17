import { Component, Output, EventEmitter, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { YearType } from '../../../models/dashboard.model';

@Component({
  selector: 'app-year-filter',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './year-filter.component.html',
  styleUrls: ['./year-filter.component.scss']
})
export class YearFilterComponent {
  @Input() selectedYear: YearType = 2026;
  @Output() yearChange = new EventEmitter<YearType>();

  years: YearType[] = [2022, 2023, 2024, 2025, 2026];

  onYearChange(year: YearType): void {
    this.selectedYear = year;
    this.yearChange.emit(year);

    // ✅ افتح اللينك فقط لو السنة مش 2026
    if (year !== 2026) {
      const url = `https://intra.soficopharm.net/dashboards?year=${year}`;
      window.open(url, '_blank');
    }
  }
}

// import { Component, Output, EventEmitter, Input } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { YearType } from '../../../models/dashboard.model';

// @Component({
//   selector: 'app-year-filter',
//   standalone: true,
//   imports: [CommonModule],
//   templateUrl: './year-filter.component.html',
//   styleUrls: ['./year-filter.component.scss']
// })
// export class YearFilterComponent {
//   // ✅ default selectedYear 2026
//   @Input() selectedYear: YearType = 2026;
//   @Output() yearChange = new EventEmitter<YearType>();
  
//   years: YearType[] = [2022, 2023, 2024, 2025, 2026];

//   onYearChange(year: YearType): void {
//     this.selectedYear = year;
//     this.yearChange.emit(year);

//     // ❗ افتح اللينك فقط لو السنة أقل من 2026
//     if (year !== 2026) {
//       const url = `https://intra.soficopharm.net/dashboards?year=${year}`;
//       window.open(url, '_blank');
//     }
//   }
// }
