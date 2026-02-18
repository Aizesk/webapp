import { ChangeDetectionStrategy, Component, signal, computed, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TopNavbarComponent } from '../../shared/components/top-navbar/top-navbar.component';
import { MAIN_NAV_ITEMS } from '../../shared/models/navigation.model';
import { ReportService, ReportResponse, ReportType, ReportFormat, GenerateReportRequest } from '../../core/services/report.service';

interface ReportTypeOption {
  readonly id: ReportType;
  readonly name: string;
  readonly description: string;
  readonly icon: string;
  readonly accentColor: string;
  readonly accentColorLight: string;
}

interface DateRangeOption {
  readonly id: string;
  readonly label: string;
  readonly getRange: () => { startDate: string; endDate: string };
}

interface ExportFormatOption {
  readonly id: ReportFormat;
  readonly label: string;
  readonly description: string;
  readonly icon: string;
}

@Component({
  selector: 'app-reports-page',
  standalone: true,
  imports: [CommonModule, FormsModule, TopNavbarComponent],
  templateUrl: './reports-page.component.html',
  styleUrls: ['./reports-page.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReportsPageComponent implements OnInit {
  private readonly reportService = inject(ReportService);

  protected readonly navItems = MAIN_NAV_ITEMS;

  // Main report types (non-platform)
  protected readonly mainReportTypes: readonly ReportTypeOption[] = [
    {
      id: 'GLOBAL',
      name: 'Reporte Global Consolidado',
      description: 'Visión unificada de todos tus ingresos y gastos.',
      icon: 'bar_chart',
      accentColor: '#2563EB',
      accentColorLight: 'rgba(37, 99, 235, 0.1)',
    },
    {
      id: 'MANUAL',
      name: 'Libro Diario Manual',
      description: 'Transacciones registradas manualmente.',
      icon: 'edit_note',
      accentColor: '#8B5CF6',
      accentColorLight: 'rgba(139, 92, 246, 0.1)',
    },
  ];

  // Platform report types (for dropdown)
  protected readonly platformReportTypes: readonly ReportTypeOption[] = [
    {
      id: 'AMAZON',
      name: 'Reporte Amazon Seller',
      description: 'Liquidaciones, comisiones FBA y ventas netas.',
      icon: 'storefront',
      accentColor: '#FF9900',
      accentColorLight: 'rgba(255, 153, 0, 0.1)',
    },
    {
      id: 'SHOPIFY',
      name: 'Reporte Shopify Store',
      description: 'Ventas brutas, pasarelas de pago y devoluciones.',
      icon: 'shopping_bag',
      accentColor: '#96BF48',
      accentColorLight: 'rgba(150, 191, 72, 0.1)',
    },
    {
      id: 'EBAY',
      name: 'Reporte eBay Marketplace',
      description: 'Subastas, listados, comisiones y ventas netas.',
      icon: 'local_offer',
      accentColor: '#0064D2',
      accentColorLight: 'rgba(0, 100, 210, 0.1)',
    },
  ];

  // Combined for backward compatibility
  protected readonly reportTypes: readonly ReportTypeOption[] = [
    ...this.mainReportTypes,
    ...this.platformReportTypes,
  ];

  // Platform dropdown state
  protected readonly showPlatformDropdown = signal<boolean>(false);

  protected readonly selectedPlatformReport = computed(() => {
    const selected = this.selectedReportType();
    return this.platformReportTypes.find(p => p.id === selected) ?? null;
  });

  protected readonly isPlatformReportSelected = computed(() => {
    const selected = this.selectedReportType();
    return this.platformReportTypes.some(p => p.id === selected);
  });

  protected readonly dateRanges: readonly DateRangeOption[] = [
    {
      id: 'current-month',
      label: 'Mes Actual',
      getRange: () => {
        const now = new Date();
        const start = new Date(now.getFullYear(), now.getMonth(), 1);
        const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        return { startDate: this.formatDate(start), endDate: this.formatDate(end) };
      }
    },
    {
      id: 'last-month',
      label: 'Mes Anterior',
      getRange: () => {
        const now = new Date();
        const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const end = new Date(now.getFullYear(), now.getMonth(), 0);
        return { startDate: this.formatDate(start), endDate: this.formatDate(end) };
      }
    },
    {
      id: 'last-quarter',
      label: 'Último Trimestre',
      getRange: () => {
        const now = new Date();
        const currentQuarter = Math.floor(now.getMonth() / 3);
        const start = new Date(now.getFullYear(), (currentQuarter - 1) * 3, 1);
        const end = new Date(now.getFullYear(), currentQuarter * 3, 0);
        return { startDate: this.formatDate(start), endDate: this.formatDate(end) };
      }
    },
    {
      id: 'year-to-date',
      label: 'Año en Curso',
      getRange: () => {
        const now = new Date();
        const start = new Date(now.getFullYear(), 0, 1);
        return { startDate: this.formatDate(start), endDate: this.formatDate(now) };
      }
    },
    {
      id: 'custom',
      label: 'Personalizado',
      getRange: () => ({ startDate: '', endDate: '' })
    },
  ];

  protected readonly exportFormats: readonly ExportFormatOption[] = [
    { id: 'PDF', label: 'PDF', description: 'Resumen visual para presentaciones', icon: 'picture_as_pdf' },
    { id: 'EXCEL', label: 'Excel', description: 'Datos con fórmulas editables', icon: 'table_view' },
    { id: 'CSV', label: 'CSV', description: 'Datos crudos para importar', icon: 'table_chart' },
  ];

  protected selectedReportType = signal<ReportType | null>(null);
  protected selectedDateRange = signal<string>('current-month');
  protected selectedFormat = signal<ReportFormat>('PDF');
  protected customStartDate = signal<string>('');
  protected customEndDate = signal<string>('');
  protected reportTitle = signal<string>('');

  protected readonly isGenerating = this.reportService.generating;
  protected readonly isLoading = this.reportService.loading;
  protected readonly error = this.reportService.error;
  protected readonly reportHistory = this.reportService.reports;

  protected isConfigPanelVisible = computed(() => this.selectedReportType() !== null);
  protected selectedReport = computed(() => this.reportTypes.find((r) => r.id === this.selectedReportType()));
  protected isCustomDateRange = computed(() => this.selectedDateRange() === 'custom');

  ngOnInit(): void {
    this.loadReportHistory();
  }

  protected loadReportHistory(): void {
    this.reportService.getReportHistory(20).subscribe();
  }

  protected selectReportType(reportId: ReportType): void {
    if (this.selectedReportType() === reportId) {
      this.selectedReportType.set(null);
    } else {
      this.selectedReportType.set(reportId);
      this.updateDefaultTitle(reportId);
    }
    this.showPlatformDropdown.set(false);
  }

  protected togglePlatformDropdown(): void {
    this.showPlatformDropdown.update(v => !v);
  }

  protected closePlatformDropdown(): void {
    this.showPlatformDropdown.set(false);
  }

  protected selectDateRange(rangeId: string): void {
    this.selectedDateRange.set(rangeId);
  }

  protected selectFormat(formatId: ReportFormat): void {
    this.selectedFormat.set(formatId);
  }

  protected onCustomStartDateChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.customStartDate.set(input.value);
  }

  protected onCustomEndDateChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.customEndDate.set(input.value);
  }

  protected onTitleChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.reportTitle.set(input.value);
  }

  protected generateReport(): void {
    const type = this.selectedReportType();
    if (!type || this.isGenerating()) return;

    const dateRange = this.getSelectedDateRange();
    if (!dateRange.startDate || !dateRange.endDate) {
      console.error('Please select a valid date range');
      return;
    }

    const request: GenerateReportRequest = {
      type,
      format: this.selectedFormat(),
      startDate: dateRange.startDate,
      endDate: dateRange.endDate,
      title: this.reportTitle() || undefined
    };

    this.reportService.generateReport(request).subscribe({
      next: report => {
        this.pollForCompletion(report.id);
      },
      error: err => console.error('Failed to generate report:', err)
    });
  }

  protected downloadReport(report: ReportResponse): void {
    this.reportService.triggerDownload(report);
  }

  protected refreshReportStatus(report: ReportResponse): void {
    this.reportService.getReportStatus(report.id).subscribe();
  }

  protected getFormatIcon(format: string): string {
    const icons: Record<string, string> = { PDF: 'picture_as_pdf', EXCEL: 'table_view', CSV: 'table_chart' };
    return icons[format] || 'picture_as_pdf';
  }

  protected getStatusIcon(status: string): string {
    const icons: Record<string, string> = {
      COMPLETED: 'check_circle',
      PENDING: 'schedule',
      PROCESSING: 'sync',
      FAILED: 'error'
    };
    return icons[status] || 'help';
  }

  protected getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      COMPLETED: 'Listo',
      PENDING: 'Pendiente',
      PROCESSING: 'Procesando',
      FAILED: 'Error'
    };
    return labels[status] || status;
  }

  protected trackByReportType(_index: number, report: ReportTypeOption): string {
    return report.id;
  }

  protected trackByHistory(_index: number, report: ReportResponse): string {
    return report.id;
  }

  private getSelectedDateRange(): { startDate: string; endDate: string } {
    if (this.selectedDateRange() === 'custom') {
      return {
        startDate: this.customStartDate(),
        endDate: this.customEndDate()
      };
    }
    const range = this.dateRanges.find(r => r.id === this.selectedDateRange());
    return range ? range.getRange() : { startDate: '', endDate: '' };
  }

  private updateDefaultTitle(type: ReportType): void {
    const reportType = this.reportTypes.find(r => r.id === type);
    if (reportType) {
      const range = this.dateRanges.find(r => r.id === this.selectedDateRange());
      this.reportTitle.set(`${reportType.name} - ${range?.label || ''}`);
    }
  }

  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  private pollForCompletion(reportId: string): void {
    this.reportService.pollReportStatus(reportId).subscribe({
      next: report => {
        if (report.status === 'COMPLETED') {
          console.log('Report ready for download:', report);
        } else if (report.status === 'FAILED') {
          console.error('Report generation failed:', report.errorMessage);
        }
      },
      error: err => console.error('Polling failed:', err)
    });
  }
}
