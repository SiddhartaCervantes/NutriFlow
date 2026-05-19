import {
  Component, Input, OnChanges, AfterViewInit,
  ViewChild, ElementRef, SimpleChanges, OnDestroy,
} from '@angular/core';
import { Chart, LineController, LineElement, PointElement,
         LinearScale, CategoryScale, Tooltip, Filler } from 'chart.js';
import { MeasurementRow } from '../../data/measurement.service';

Chart.register(LineController, LineElement, PointElement, LinearScale, CategoryScale, Tooltip, Filler);

@Component({
  selector: 'app-weight-chart',
  standalone: true,
  template: `
    <div style="position:relative; width:100%; height:180px">
      <canvas #canvas></canvas>
    </div>
  `,
})
export class WeightChartComponent implements AfterViewInit, OnChanges, OnDestroy {
  @Input() measurements: MeasurementRow[] = [];
  @ViewChild('canvas') canvasRef!: ElementRef<HTMLCanvasElement>;

  private chart: Chart | null = null;

  ngAfterViewInit(): void { this.buildChart(); }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['measurements'] && this.chart) this.updateChart();
  }

  ngOnDestroy(): void { this.chart?.destroy(); }

  private get sorted(): MeasurementRow[] {
    return [...this.measurements].sort(
      (a, b) => new Date(a.measured_at).getTime() - new Date(b.measured_at).getTime()
    );
  }

  private buildChart(): void {
    const rows   = this.sorted;
    const labels = rows.map(r =>
      new Date(r.measured_at + 'T00:00:00').toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })
    );
    const weights = rows.map(r => r.weight_kg);

    this.chart = new Chart(this.canvasRef.nativeElement, {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: 'Peso (kg)',
          data: weights,
          borderColor: '#2e7d32',
          backgroundColor: 'rgba(46,125,50,0.08)',
          pointBackgroundColor: '#2e7d32',
          pointRadius: 4,
          tension: 0.35,
          fill: true,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { tooltip: { mode: 'index', intersect: false }, legend: { display: false } },
        scales: {
          x: { grid: { display: false }, ticks: { font: { size: 11 } } },
          y: {
            ticks: { font: { size: 11 }, callback: v => `${v} kg` },
            grid: { color: 'rgba(0,0,0,0.06)' },
          },
        },
      },
    });
  }

  private updateChart(): void {
    if (!this.chart) return;
    const rows = this.sorted;
    this.chart.data.labels = rows.map(r =>
      new Date(r.measured_at + 'T00:00:00').toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })
    );
    this.chart.data.datasets[0].data = rows.map(r => r.weight_kg);
    this.chart.update();
  }
}
