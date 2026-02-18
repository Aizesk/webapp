import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { tap, catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export type ReportType = 'GLOBAL' | 'AMAZON' | 'SHOPIFY' | 'EBAY' | 'MANUAL';
export type ReportFormat = 'PDF' | 'EXCEL' | 'CSV';
export type ReportStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';

export interface GenerateReportRequest {
  type: ReportType;
  format: ReportFormat;
  startDate: string;
  endDate: string;
  title?: string;
}

export interface ReportResponse {
  id: string;
  userId: string;
  type: ReportType;
  format: ReportFormat;
  status: ReportStatus;
  startDate: string;
  endDate: string;
  requestedAt: string;
  completedAt: string | null;
  fileUrl: string | null;
  errorMessage: string | null;
  downloadable: boolean;
  typeDisplayName: string;
  dateRangeDisplay: string;
}

export interface MonthlyPreference {
  enabled: boolean;
}

@Injectable({ providedIn: 'root' })
export class ReportService {
  private readonly apiUrl = `${environment.apiUrls.reporting.replace('/api/v1/reports', '')}/api/reports`;

  private readonly _reports = signal<ReportResponse[]>([]);
  private readonly _loading = signal<boolean>(false);
  private readonly _generating = signal<boolean>(false);
  private readonly _error = signal<string | null>(null);

  readonly reports = this._reports.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly generating = this._generating.asReadonly();
  readonly error = this._error.asReadonly();

  constructor(private readonly http: HttpClient) {}

  generateReport(request: GenerateReportRequest): Observable<ReportResponse> {
    this._generating.set(true);
    this._error.set(null);

    return this.http.post<ReportResponse>(`${this.apiUrl}/generate`, request).pipe(
      tap(report => {
        this._generating.set(false);
        this._reports.update(reports => [report, ...reports]);
      }),
      catchError(err => this.handleError(err, 'generating'))
    );
  }

  getReportStatus(reportId: string): Observable<ReportResponse> {
    return this.http.get<ReportResponse>(`${this.apiUrl}/${reportId}/status`).pipe(
      tap(report => {
        this._reports.update(reports =>
          reports.map(r => (r.id === report.id ? report : r))
        );
      }),
      catchError(err => this.handleError(err, 'status'))
    );
  }

  downloadReport(reportId: string): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${reportId}/download`, {
      responseType: 'blob'
    }).pipe(
      catchError(err => this.handleError(err, 'download'))
    );
  }

  getReportHistory(limit: number = 10): Observable<ReportResponse[]> {
    this._loading.set(true);
    this._error.set(null);

    return this.http.get<ReportResponse[]>(`${this.apiUrl}/history?limit=${limit}`).pipe(
      tap(reports => {
        this._reports.set(reports);
        this._loading.set(false);
      }),
      catchError(err => this.handleError(err, 'loading'))
    );
  }

  getMonthlyPreference(): Observable<MonthlyPreference> {
    return this.http.get<MonthlyPreference>(`${this.apiUrl}/preferences/monthly`).pipe(
      catchError(err => this.handleError(err, 'preferences'))
    );
  }

  updateMonthlyPreference(enabled: boolean): Observable<MonthlyPreference> {
    return this.http.put<MonthlyPreference>(`${this.apiUrl}/preferences/monthly`, { enabled }).pipe(
      catchError(err => this.handleError(err, 'preferences'))
    );
  }

  pollReportStatus(reportId: string, intervalMs: number = 2000, maxAttempts: number = 30): Observable<ReportResponse> {
    return new Observable(observer => {
      let attempts = 0;
      const poll = setInterval(() => {
        attempts++;
        this.getReportStatus(reportId).subscribe({
          next: report => {
            if (report.status === 'COMPLETED' || report.status === 'FAILED') {
              clearInterval(poll);
              observer.next(report);
              observer.complete();
            } else if (attempts >= maxAttempts) {
              clearInterval(poll);
              observer.error(new Error('Report generation timeout'));
            }
          },
          error: err => {
            clearInterval(poll);
            observer.error(err);
          }
        });
      }, intervalMs);

      return () => clearInterval(poll);
    });
  }

  triggerDownload(report: ReportResponse): void {
    if (!report.downloadable || !report.fileUrl) return;

    this.downloadReport(report.id).subscribe({
      next: blob => {
        const extensionMap: Record<ReportFormat, string> = {
          'PDF': 'pdf',
          'EXCEL': 'xlsx',
          'CSV': 'csv'
        };
        const extension = extensionMap[report.format] || report.format.toLowerCase();
        const filename = `${report.typeDisplayName.replace(/\s+/g, '_')}_${report.dateRangeDisplay.replace(/\s+/g, '_')}.${extension}`;
        
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.click();
        window.URL.revokeObjectURL(url);
      },
      error: err => console.error('Download failed:', err)
    });
  }

  private handleError(error: HttpErrorResponse, operation: string): Observable<never> {
    this._loading.set(false);
    this._generating.set(false);
    
    const message = error.error?.message || error.message || `Error ${operation} report`;
    this._error.set(message);
    
    return throwError(() => new Error(message));
  }
}
