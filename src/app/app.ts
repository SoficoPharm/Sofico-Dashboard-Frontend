import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
// import { SalesChartComponent } from "./features/dashboard/components/sales-chart/sales-chart.component";
import { CommonModule } from '@angular/common';
// import { SalesWidgetComponent } from "./features/dashboard/components/kpi-widgets/sales-widget/sales-widget.component";
import { HeaderComponent } from "./layout/header/header.component";
import { SidebarComponent } from "./layout/sidebar/sidebar.component";
import { FooterComponent } from "./layout/footer/footer.component";

@Component({
  selector: 'app-root',
  imports: [CommonModule,RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('sofico-dashboard');
}
