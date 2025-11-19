import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NgFor } from '@angular/common';
import { ButtonComponent } from '../../shared/components/button/button.component';

interface GeneratedReport {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly updatedAt: string;
  readonly amount: string;
  readonly frequency: 'Semanal' | 'Mensual' | 'Trimestral';
  readonly format: 'PDF' | 'XLSX' | 'Dashboard';
  readonly highlights: readonly string[];
  readonly sharedWith: number;
  readonly trend: 'up' | 'down';
}

interface QuickMetric {
  readonly label: string;
  readonly value: string;
  readonly trendLabel: string;
  readonly positive: boolean;
}

interface SuggestedTemplate {
  readonly id: string;
  readonly title: string;
  readonly benefit: string;
  readonly complexity: 'Baja' | 'Media' | 'Alta';
}

@Component({
  selector: 'app-reports-page',
  standalone: true,
  imports: [NgFor, ButtonComponent],
  templateUrl: './reports-page.component.html',
  styleUrls: ['./reports-page.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ReportsPageComponent {
  protected readonly periodFilters = [
    { value: 'last-7', label: '7 días' },
    { value: 'last-30', label: '30 días' },
    { value: 'quarter', label: 'Último trimestre' },
    { value: 'year', label: 'Último año' }
  ];

  protected selectedPeriod = 'last-30';

  protected readonly generatedReports: readonly GeneratedReport[] = [
    {
      id: 'monthly-recurring',
      name: 'Ingresos recurrentes mensuales',
      description: 'Proyección de MRR consolidada por canales principales y neto retenido.',
      updatedAt: 'Actualizado hace 2 horas',
      amount: '$42,300',
      frequency: 'Mensual',
      format: 'PDF',
      highlights: ['+8.4% vs mes anterior', 'Churn del 3.1%'],
      sharedWith: 6,
      trend: 'up'
    },
    {
      id: 'cashflow-weekly',
      name: 'Cashflow operativo semanal',
      description: 'Liquidez disponible, entradas programadas y gasto fijo estimado.',
      updatedAt: 'Ayer 18:12',
      amount: '$18,950',
      frequency: 'Semanal',
      format: 'Dashboard',
      highlights: ['Genera alertas de déficit', 'Automatiza recordatorios de cobro'],
      sharedWith: 3,
      trend: 'up'
    },
    {
      id: 'campaign-roas',
      name: 'ROAS campañas colaborativas',
      description: 'Comparativa de campañas con creadores, inversión y retorno neto.',
      updatedAt: 'Hace 4 días',
      amount: '$9,740',
      frequency: 'Trimestral',
      format: 'XLSX',
      highlights: ['Top 3 campañas con 5.4x', 'Alertas de costo por lead'],
      sharedWith: 2,
      trend: 'down'
    }
  ];

  protected readonly quickMetrics: readonly QuickMetric[] = [
    { label: 'Informes generados', value: '36', trendLabel: '+5 este mes', positive: true },
    { label: 'Automatizaciones activas', value: '12', trendLabel: '2 pendientes', positive: false },
    { label: 'Tasa de apertura', value: '78%', trendLabel: '+12 pts', positive: true }
  ];

  protected readonly suggestedTemplates: readonly SuggestedTemplate[] = [
    {
      id: 'risk-score',
      title: 'Score de riesgo por cliente',
      benefit: 'Cruza morosidad y exposición para priorizar acciones de cobranza.',
      complexity: 'Media'
    },
    {
      id: 'tax-simulation',
      title: 'Simulación fiscal trimestral',
      benefit: 'Anticipa provisiones según proyección de ingresos y deducciones.',
      complexity: 'Alta'
    },
    {
      id: 'creator-ranking',
      title: 'Ranking de creadores y revenue share',
      benefit: 'Detecta alianzas con mejor margen y oportunidades de escalado.',
      complexity: 'Baja'
    }
  ];

  protected handlePeriodChange(value: string): void {
    this.selectedPeriod = value;
  }

  protected handleDownload(report: GeneratedReport): void {
    console.log('download-report', report.id);
  }

  protected handleSchedule(report: GeneratedReport): void {
    console.log('schedule-report', report.id);
  }

  protected handleTemplate(template: SuggestedTemplate): void {
    console.log('start-template', template.id);
  }
}
