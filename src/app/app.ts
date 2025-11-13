import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SalesChartComponent } from "./features/dashboard/components/sales-chart/sales-chart.component";
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  imports: [CommonModule, SalesChartComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('sofico-dashboard');
}
