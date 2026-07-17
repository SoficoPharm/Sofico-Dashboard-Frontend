import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent, HeaderDashboardFilter } from '../../../../layout/header/header.component';
import { DashboardPageComponent } from '../dashboard-page/dashboard-page.component';

@Component({
  selector: 'app-dashboard-shell',
  standalone: true,
  imports: [CommonModule, HeaderComponent, DashboardPageComponent],
  templateUrl: './dashboard-shell.html',
  styleUrl: './dashboard-shell.scss',
})
export class DashboardShell implements OnInit {
  dashboardFilter: HeaderDashboardFilter | null = null;

  ngOnInit(): void {
    console.log('SHELL ngOnInit 🔥');
  }

  onFiltersChange(filter: HeaderDashboardFilter): void {
    console.log('SHELL received filter 🔥', filter);
    this.dashboardFilter = { ...filter };
  }
}