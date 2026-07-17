import {
  Component,
  Input,
  OnInit,
  ViewChild,
  ElementRef,
  AfterViewInit,
  OnChanges,
  SimpleChanges,
  OnDestroy
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Chart, ChartConfiguration, registerables, Plugin } from 'chart.js';

Chart.register(...registerables);

const verticalHoverLinePlugin: Plugin<'line'> = {
  id: 'verticalHoverLine',

  afterDraw(chart) {
    const activeElements = chart.tooltip?.getActiveElements();

    if (!activeElements || activeElements.length === 0) {
      return;
    }

    const ctx = chart.ctx;
    const x = activeElements[0].element.x;
    const topY = chart.chartArea.top;
    const bottomY = chart.chartArea.bottom;

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(x, topY);
    ctx.lineTo(x, bottomY);
    ctx.lineWidth = 1;
    ctx.strokeStyle = 'rgba(7, 41, 31, 0.12)';
    ctx.stroke();
    ctx.restore();
  }
};

@Component({
  selector: 'app-line-chart',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './line-chart.component.html',
  styleUrls: ['./line-chart.component.scss']
})
export class LineChartComponent implements OnInit, AfterViewInit, OnChanges, OnDestroy {
  @ViewChild('chartCanvas', { static: false }) chartCanvas!: ElementRef<HTMLCanvasElement>;
  @Input() data: any;
  @Input() options: any;

  private chart?: Chart;

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    this.renderChart();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data'] && !changes['data'].firstChange) {
      this.updateChart();
    }
  }

  private renderChart(): void {
    if (!this.chartCanvas) return;

    const ctx = this.chartCanvas.nativeElement.getContext('2d');
    if (!ctx) return;

    const config: ChartConfiguration<'line'> = {
      type: 'line',
      data: this.data,
      options: this.options,
      plugins: [verticalHoverLinePlugin]
    };

    this.chart = new Chart(ctx, config);
  }

  private updateChart(): void {
    if (this.chart) {
      this.chart.data = this.data;
      this.chart.options = this.options;
      this.chart.update();
    }
  }

  ngOnDestroy(): void {
    if (this.chart) {
      this.chart.destroy();
    }
  }
}