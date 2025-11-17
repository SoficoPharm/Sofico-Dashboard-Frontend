import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TimeframeType } from '../../models/dashboard.model';
import { SalesChartComponent } from '../../components/sales-chart/sales-chart.component';
import { SalesWidgetComponent } from '../../components/kpi-widgets/sales-widget/sales-widget.component';
import { StatisticsWidgetComponent } from '../../components/kpi-widgets/statistics-widget/statistics-widget.component';
import { BreakEvenWidgetComponent } from '../../components/kpi-widgets/break-even-widget/break-even-widget.component';
import { OursWidgetComponent } from '../../components/kpi-widgets/ours-widget/ours-widget.component';
import { TopVendorsComponent } from '../../components/top-vendors/top-vendors.component';
import { InfoBoxComponent } from "../../components/info-box/info-box.component";

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [
    CommonModule,
    SalesChartComponent,
    SalesWidgetComponent,
    StatisticsWidgetComponent,
    BreakEvenWidgetComponent,
    OursWidgetComponent,
    TopVendorsComponent,
    InfoBoxComponent
],
  templateUrl: './dashboard-page.component.html',
  styleUrls: ['./dashboard-page.component.scss']
})
export class DashboardPageComponent {
  globalTimeframe: TimeframeType = 'Today';

  onTimeframeChange(timeframe: TimeframeType): void {
    this.globalTimeframe = timeframe;
    console.log('Global timeframe changed:', timeframe);
  }
}