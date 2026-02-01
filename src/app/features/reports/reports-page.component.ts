import { ChangeDetectionStrategy, Component, signal, computed } from '@angular/core';
import { NgFor, NgIf, DatePipe, UpperCasePipe } from '@angular/common';
import { TopNavbarComponent } from '../../shared/components/top-navbar/top-navbar.component';
import { MAIN_NAV_ITEMS } from '../../shared/models/navigation.model';

// 
// INTERFACES
// 

interface ReportType {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly icon: string;
  readonly accentColor: string;
  readonly accentColorLight: string;
}

interface DateRange {
  readonly id: string;
  readonly label: string;
}

interface ExportFormat {
  readonly id: 'pdf' | 'excel' | 'csv';
  readonly label: string;
  readonly description: string;
  readonly icon: string;
}

interface ReportHistory {
  readonly id: string;
  readonly name: string;
  readonly generatedAt: Date;
  readonly dateRange: string;
  readonly format: 'pdf' | 'excel' | 'csv';
  readonly status: 'ready' | 'processing' | 'failed';
  readonly downloadUrl?: string;
}

// 
// SVG ICONS (Inline paths)
// 

const ICONS = {
  global: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3v18h18"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/></svg>`,
  amazon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M.045 18.02c.072-.116.187-.124.348-.022 3.636 2.11 7.594 3.166 11.87 3.166 2.852 0 5.668-.533 8.447-1.595l.315-.14c.138-.06.234-.1.293-.13.226-.088.39-.046.493.13.12.195.062.39-.175.583-.236.166-.628.443-1.178.834-.55.39-1.063.72-1.54.987-.478.268-1.14.585-1.987.95-.847.365-1.62.64-2.324.823-.703.183-1.5.33-2.388.44-.89.11-1.6.165-2.128.165-1.89 0-3.72-.29-5.49-.872-1.77-.58-3.22-1.25-4.35-2.008-.254-.172-.38-.374-.38-.605 0-.14.048-.25.144-.333l.03-.03zM6.87 15.365c.09-.12.24-.18.45-.18.396.027.735.086 1.017.175.282.09.614.24.996.45.382.21.666.38.85.507.184.126.515.37.993.73.478.36.742.56.793.6.05.04.182.12.393.24.212.12.322.18.332.18.24.12.395.282.463.487.068.204.02.402-.146.594-.166.192-.342.296-.527.313-.185.017-.462-.037-.83-.162-.368-.125-.695-.28-.98-.463-.284-.183-.64-.456-1.066-.817-.426-.362-.754-.644-.983-.846-.23-.203-.544-.478-.944-.825-.4-.347-.608-.523-.627-.527-.087-.04-.18-.114-.28-.22-.1-.108-.15-.19-.15-.25 0-.08.08-.187.24-.32l.006-.006zm12.093-2.28c.12-.08.283-.055.49.08.08.04.39.283.93.73.54.447.952.82 1.234 1.12.28.3.573.68.876 1.14.304.46.485.86.543 1.2.058.34.023.657-.108.952-.13.296-.365.473-.704.532-.34.06-.72.006-1.14-.16-.42-.166-.768-.38-1.044-.64-.276-.26-.5-.49-.67-.69-.17-.2-.382-.46-.637-.78-.254-.32-.446-.59-.575-.81-.13-.22-.283-.48-.46-.78-.177-.3-.287-.51-.333-.63-.047-.12-.043-.25.01-.39.055-.14.21-.27.466-.39.257-.12.446-.18.566-.18.12 0 .233.05.34.15.107.1.253.26.44.48.186.22.37.436.55.65.18.214.386.434.62.66.232.225.39.375.47.45.22.2.422.34.606.42.184.08.35.1.5.06.15-.04.27-.125.36-.255.09-.13.07-.295-.06-.495-.13-.2-.31-.395-.54-.585-.23-.19-.552-.43-.968-.72-.416-.29-.712-.52-.887-.69-.176-.17-.296-.36-.36-.57-.064-.21-.026-.41.114-.6zm-5.17-1.06c.053-.12.133-.17.24-.14.107.03.274.1.5.21.227.11.453.24.68.39.227.15.453.33.68.54.227.21.427.41.6.6.173.19.32.39.44.6.12.21.207.4.26.57.053.17.073.32.06.45-.013.13-.067.24-.16.33-.093.09-.213.12-.36.09-.147-.03-.333-.12-.56-.27-.227-.15-.453-.34-.68-.57-.227-.23-.44-.46-.64-.69-.2-.23-.373-.46-.52-.69-.147-.23-.253-.42-.32-.57-.067-.15-.073-.26-.02-.33l.8-.52z"/></svg>`,
  shopify: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M15.337 3.415c-.074-.024-.3.007-.3.007s-1.893-.035-2.705-.054c-.4-.008-1.16-.9-1.296-.9s-2.604.85-2.604.85c-.156.054-.272.18-.33.348-.057.168-1.224 3.767-1.224 3.767l-3.727.908s-.384.1-.444.283c-.06.183-.03.256.003.383.034.127 1.177 9.077 1.177 9.077s.05.347.31.444c.26.097 2.9-1.07 2.9-1.07l2.09-1.004s.227-.117.27-.278c.04-.16-.007-.33-.057-.48-.05-.15-.74-2.257-.74-2.257s1.173.84 2.07.924c.557.053.87-.387.87-.387s.107-.23-.14-.47c-.246-.24-1.41-1.063-1.41-1.063s1.623-.66 2.16-1.87c.313-.703.32-1.41.27-1.68-.15-.81-.88-1.31-.88-1.31s-.027-.287-.02-.4c.01-.12.07-.25.07-.25s-.3-.71-.59-.77c-.247-.05-.5.15-.5.15s-.523.41-.903.68c-.11.08-.19.09-.29.06-.49-.15-1.18-.28-1.99-.36-.813-.08-1.6-.06-2.3.06-.693.13-1.28.34-1.77.66-.49.32-.85.68-1.1 1.1-.25.42-.36.87-.33 1.37.03.5.17.94.4 1.33.23.39.56.71.97.96.41.25.87.42 1.37.51.5.09.99.09 1.48.01.49-.08.92-.22 1.3-.43.38-.21.68-.46.9-.76.05-.06.1-.14.15-.23.08-.17.05-.35-.1-.46-.61-.46-1.34-.86-2.14-1.08-.77-.21-1.48-.26-2.08-.14-.6.12-1.07.38-1.4.78-.33.4-.44.87-.33 1.37.11.5.4.93.84 1.26.44.33.98.53 1.59.58.61.05 1.2-.06 1.74-.33.54-.27.97-.65 1.27-1.13.14-.21.25-.45.32-.71l1.65 5.07s.13.38.51.43c.38.05.57-.14.57-.14l2.53-.93 2.55-1.15s.35-.17.39-.44c.04-.27-.22-.49-.22-.49l-1.1-.85-1.35-1.06 4.02-1.87s.3-.14.27-.42c-.03-.28-.34-.5-.34-.5l-4.78-3.68c-.24-.19-.1-.44-.1-.44l2.18-6.86c.09-.26.01-.52-.24-.64z"/></svg>`,
  manual: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>`,
  pdf: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><path d="M9 15h6"/><path d="M9 11h6"/></svg>`,
  excel: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="16" y2="17"/></svg>`,
  csv: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>`,
  download: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>`,
  spinner: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"/><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"/><line x1="2" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="22" y2="12"/><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"/><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"/></svg>`,
  check: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`,
  error: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`,
  clock: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`,
} as const;

// 
// COMPONENT
// 

@Component({
  selector: 'app-reports-page',
  standalone: true,
  imports: [NgFor, NgIf, DatePipe, UpperCasePipe, TopNavbarComponent],
  templateUrl: './reports-page.component.html',
  styleUrls: ['./reports-page.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReportsPageComponent {
  protected readonly navItems = MAIN_NAV_ITEMS;
  protected readonly icons = ICONS;

  // Report Types (Cards)
  protected readonly reportTypes: readonly ReportType[] = [
    {
      id: 'global',
      name: 'Reporte Global Consolidado',
      description: 'Vision unificada de todos tus ingresos y gastos.',
      icon: ICONS.global,
      accentColor: '#2563EB',
      accentColorLight: 'rgba(37, 99, 235, 0.1)',
    },
    {
      id: 'amazon',
      name: 'Reporte Amazon Seller',
      description: 'Liquidaciones, comisiones FBA y ventas netas.',
      icon: ICONS.amazon,
      accentColor: '#FF9900',
      accentColorLight: 'rgba(255, 153, 0, 0.1)',
    },
    {
      id: 'shopify',
      name: 'Reporte Shopify Store',
      description: 'Ventas brutas, pasarelas de pago y devoluciones.',
      icon: ICONS.shopify,
      accentColor: '#96BF48',
      accentColorLight: 'rgba(150, 191, 72, 0.1)',
    },
    {
      id: 'manual',
      name: 'Libro Diario Manual',
      description: 'Transacciones registradas manualmente.',
      icon: ICONS.manual,
      accentColor: '#8B5CF6',
      accentColorLight: 'rgba(139, 92, 246, 0.1)',
    },
  ];

  // Date Ranges
  protected readonly dateRanges: readonly DateRange[] = [
    { id: 'current-month', label: 'Mes Actual' },
    { id: 'last-quarter', label: 'Trimestre Pasado' },
    { id: 'fiscal-year', label: 'Ano Fiscal' },
    { id: 'custom', label: 'Rango Personalizado' },
  ];

  // Export Formats
  protected readonly exportFormats: readonly ExportFormat[] = [
    { id: 'pdf', label: 'PDF', description: 'Resumen visual para presentaciones', icon: ICONS.pdf },
    { id: 'excel', label: 'Excel', description: 'Datos con formulas editables', icon: ICONS.excel },
    { id: 'csv', label: 'CSV', description: 'Datos crudos para importar', icon: ICONS.csv },
  ];

  // Report History (Mock Data)
  protected readonly reportHistory: readonly ReportHistory[] = [
    { id: '1', name: 'Reporte Global Consolidado', generatedAt: new Date(2026, 0, 31, 14, 30), dateRange: 'Enero 2026', format: 'pdf', status: 'ready', downloadUrl: '#' },
    { id: '2', name: 'Reporte Amazon Seller', generatedAt: new Date(2026, 0, 28, 9, 15), dateRange: 'Q4 2025', format: 'excel', status: 'ready', downloadUrl: '#' },
    { id: '3', name: 'Reporte Shopify Store', generatedAt: new Date(2026, 0, 25, 16, 45), dateRange: 'Diciembre 2025', format: 'csv', status: 'ready', downloadUrl: '#' },
    { id: '4', name: 'Libro Diario Manual', generatedAt: new Date(2026, 0, 20, 11, 0), dateRange: 'Ano Fiscal 2025', format: 'pdf', status: 'ready', downloadUrl: '#' },
    { id: '5', name: 'Reporte Global Consolidado', generatedAt: new Date(2026, 0, 15, 8, 30), dateRange: 'Q3 2025', format: 'excel', status: 'ready', downloadUrl: '#' },
  ];

  // State (Signals)
  protected selectedReportType = signal<string | null>(null);
  protected selectedDateRange = signal<string>('current-month');
  protected selectedFormat = signal<'pdf' | 'excel' | 'csv'>('pdf');
  protected isGenerating = signal<boolean>(false);

  // Computed
  protected isConfigPanelVisible = computed(() => this.selectedReportType() !== null);
  protected selectedReport = computed(() => this.reportTypes.find((r) => r.id === this.selectedReportType()));

  // Methods
  protected selectReportType(reportId: string): void {
    if (this.selectedReportType() === reportId) {
      this.selectedReportType.set(null);
    } else {
      this.selectedReportType.set(reportId);
    }
  }

  protected selectDateRange(rangeId: string): void {
    this.selectedDateRange.set(rangeId);
  }

  protected selectFormat(formatId: 'pdf' | 'excel' | 'csv'): void {
    this.selectedFormat.set(formatId);
  }

  protected generateReport(): void {
    if (this.isGenerating()) return;
    this.isGenerating.set(true);
    setTimeout(() => {
      this.isGenerating.set(false);
      console.log('Report generated:', { type: this.selectedReportType(), dateRange: this.selectedDateRange(), format: this.selectedFormat() });
    }, 2500);
  }

  protected downloadReport(report: ReportHistory): void {
    console.log('Downloading report:', report);
  }

  protected getFormatIcon(format: 'pdf' | 'excel' | 'csv'): string {
    const icons: Record<string, string> = { pdf: ICONS.pdf, excel: ICONS.excel, csv: ICONS.csv };
    return icons[format] || ICONS.pdf;
  }

  protected getStatusIcon(status: 'ready' | 'processing' | 'failed'): string {
    const icons: Record<string, string> = { ready: ICONS.check, processing: ICONS.clock, failed: ICONS.error };
    return icons[status] || ICONS.check;
  }

  protected trackByReportType(_index: number, report: ReportType): string {
    return report.id;
  }

  protected trackByHistory(_index: number, report: ReportHistory): string {
    return report.id;
  }
}
