import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-sales-overview',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sales-overview.component.html',
  styleUrls: ['./sales-overview.component.scss']
})
export class SalesOverviewComponent {
  title = 'Sales Overview';
}