import { AuthService, UserDto } from './../../features/auth/services/auth.service';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface HeaderDashboardFilter {
  mode: 'month' | 'range' | 'default';
  month: number | null;
  year: number | null;
  fromDate: string | null;
  toDate: string | null;
  startDate: string;
  endDate: string;
}

interface MonthOption {
  key: string;
  month: number;
  year: number;
  label: string;
}

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  @Output() filtersChange = new EventEmitter<HeaderDashboardFilter>();

  currentUser: UserDto | null = null;

  monthOptions: MonthOption[] = [];
  selectedMonthKey = '';

  fromDate: string | null = null;
  toDate: string | null = null;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    console.log('HEADER ngOnInit');

    this.authService.currentUser$.subscribe(user => {
      console.log('HEADER currentUser changed', user);
      this.currentUser = user;
    });

    this.buildMonthOptions();

    const today = new Date();
    this.selectedMonthKey = this.buildMonthKey(today.getFullYear(), today.getMonth() + 1);

    console.log('HEADER initial selectedMonthKey', this.selectedMonthKey);
  }

  onLogout(): void {
    console.log('HEADER logout clicked');

    if (confirm('Are you sure you want to logout?')) {
      this.authService.logout();
    }
  }

  goToPreviousMonth(): void {
    const current = this.getSelectedMonthOption();
    console.log('HEADER previous month clicked', current);

    if (!current) return;

    const currentIndex = this.monthOptions.findIndex(x => x.key === current.key);
    if (currentIndex > 0) {
      this.selectedMonthKey = this.monthOptions[currentIndex - 1].key;
      console.log('HEADER selectedMonthKey after previous', this.selectedMonthKey);
    }
  }

  goToNextMonth(): void {
    const current = this.getSelectedMonthOption();
    console.log('HEADER next month clicked', current);

    if (!current) return;

    const currentIndex = this.monthOptions.findIndex(x => x.key === current.key);
    if (currentIndex < this.monthOptions.length - 1) {
      this.selectedMonthKey = this.monthOptions[currentIndex + 1].key;
      console.log('HEADER selectedMonthKey after next', this.selectedMonthKey);
    }
  }

  onMonthlySearch(): void {
    console.log('HEADER monthly search clicked');
    this.emitMonthFilter();
  }

  clearMonthly(): void {
    console.log('HEADER clearMonthly clicked');

    // امسح أي range state قديم
    this.fromDate = null;
    this.toDate = null;

    const today = new Date();
    this.selectedMonthKey = this.buildMonthKey(today.getFullYear(), today.getMonth() + 1);

    const todayDate = this.formatDate(today);

    const payload: HeaderDashboardFilter = {
      mode: 'default',
      month: today.getMonth() + 1,
      year: today.getFullYear(),
      fromDate: null,
      toDate: null,
      startDate: todayDate,
      endDate: todayDate
    };

    console.log('HEADER emitting default filter from clearMonthly', payload);

    // emit جديد واضح
    this.filtersChange.emit({ ...payload });
  }

  onRangeSearch(): void {
    console.log('HEADER range search clicked', {
      fromDate: this.fromDate,
      toDate: this.toDate
    });

    if (this.fromDate && !this.toDate) {
      alert('Please select To date.');
      return;
    }

    if (!this.fromDate && this.toDate) {
      alert('Please select From date.');
      return;
    }

    if (!this.fromDate || !this.toDate) {
      alert('Please select From and To dates.');
      return;
    }

    let start = this.fromDate;
    let end = this.toDate;

    if (start > end) {
      const temp = start;
      start = end;
      end = temp;
      this.fromDate = start;
      this.toDate = end;
    }

    const payload: HeaderDashboardFilter = {
      mode: 'range',
      month: null,
      year: null,
      fromDate: start,
      toDate: end,
      startDate: start,
      endDate: end
    };

    console.log('HEADER emitting range filter', payload);
    this.filtersChange.emit({ ...payload });
  }

  clearRange(): void {
    console.log('HEADER clearRange clicked');

    this.fromDate = null;
    this.toDate = null;

    const today = new Date();
    this.selectedMonthKey = this.buildMonthKey(today.getFullYear(), today.getMonth() + 1);

    const todayDate = this.formatDate(today);

    const payload: HeaderDashboardFilter = {
      mode: 'default',
      month: today.getMonth() + 1,
      year: today.getFullYear(),
      fromDate: null,
      toDate: null,
      startDate: todayDate,
      endDate: todayDate
    };

    console.log('HEADER emitting default filter from clearRange', payload);
    this.filtersChange.emit({ ...payload });
  }

  private emitMonthFilter(): void {
    const selected = this.getSelectedMonthOption();
    console.log('HEADER emitMonthFilter selected option', selected);

    if (!selected) return;

    // امسح range state لما أشتغل بفلتر الشهر
    this.fromDate = null;
    this.toDate = null;

    const startDate = this.formatDate(new Date(selected.year, selected.month - 1, 1));
    const endDate = this.formatDate(new Date(selected.year, selected.month, 0));

    const payload: HeaderDashboardFilter = {
      mode: 'month',
      month: selected.month,
      year: selected.year,
      fromDate: null,
      toDate: null,
      startDate,
      endDate
    };

    console.log('HEADER emitting month filter', payload);
    this.filtersChange.emit({ ...payload });
  }

  private getSelectedMonthOption(): MonthOption | undefined {
    const selected = this.monthOptions.find(x => x.key === this.selectedMonthKey);
    console.log('HEADER getSelectedMonthOption', {
      selectedMonthKey: this.selectedMonthKey,
      selected
    });
    return selected;
  }

private buildMonthOptions(): void {
  const startYear = 2026;   // 👈 تعديل هنا
  const endYear = 2026;     // 👈 تعديل هنا

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const options: MonthOption[] = [];

  for (let year = startYear; year <= endYear; year++) {
    for (let month = 1; month <= 12; month++) {
      options.push({
        key: this.buildMonthKey(year, month),
        month,
        year,
        label: `${monthNames[month - 1]} ${year}`
      });
    }
  }

  this.monthOptions = options;
}

  private buildMonthKey(year: number, month: number): string {
    return `${year}-${String(month).padStart(2, '0')}`;
  }

  private formatDate(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
}