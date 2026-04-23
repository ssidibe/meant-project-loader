import { Component, ViewChild } from '@angular/core';
import {
  ChartComponent,
  ApexAxisChartSeries,
  ApexChart,
  ApexXAxis,
  ApexDataLabels,
  ApexStroke,
  ApexYAxis,
  ApexFill,
  ApexLegend,
  ApexPlotOptions,
  NgApexchartsModule,
} from 'ng-apexcharts';

export type ChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  dataLabels: ApexDataLabels;
  plotOptions: ApexPlotOptions;
  stroke: ApexStroke;
  xaxis: ApexXAxis;
  yaxis: ApexYAxis;
  colors: string[];
  fill: ApexFill;
  legend: ApexLegend;
};

@Component({
  selector: 'app-axes',
  imports: [ChartComponent, NgApexchartsModule],
  templateUrl: './axes.html',
  styleUrl: './axes.scss',
})
export class Axes {
  public chartOptions: Partial<ChartOptions> = {
    series: [
      {
        name: 'Data 1',
        group: 'budget',
        data: [44000, 55000, 41000, 67000, 22000, 43000],
      },
      {
        name: 'Data 2',
        group: 'budget',
        data: [13000, 36000, 20000, 8000, 13000, 27000],
      },
      {
        name: 'Data 3',
        group: 'actual',
        data: [48000, 50000, 40000, 65000, 25000, 40000],
      },
      {
        name: 'Data 4',
        group: 'actual',
        data: [20000, 40000, 25000, 10000, 12000, 28000],
      },
    ],
    chart: {
      type: 'bar',
      height: 350,
      stacked: true,
    },
    stroke: {
      width: 1,
      colors: ['#fff'],
    },
    dataLabels: {
      formatter: (val) => {
        return Number(val) / 1000 + 'K';
      },
    },
    plotOptions: {
      bar: {
        horizontal: false,
      },
    },
    xaxis: {
      categories: [
        'Ministere 1',
        'Ministere 2',
        'Ministere 3',
        'Ministere 3',
        'Ministere 4',
        'Ministere 4',
      ],
    },
    fill: {
      opacity: 1,
    },
    colors: ['#2E7D64', '#4A90E2', '#2E7D64', '#4A90E2'],
    yaxis: {
      labels: {
        formatter: (val) => {
          return val / 1000 + 'K';
        },
      },
    },
    legend: {
      position: 'top',
      horizontalAlign: 'left',
    },
  };
}
