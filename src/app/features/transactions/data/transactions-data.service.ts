import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import {
  DetailedTransaction,
  PlatformDistribution,
  TransactionMetric,
  TransactionsSnapshot
} from '../../../shared/models/transactions.model';

@Injectable({ providedIn: 'root' })
export class TransactionsDataService {
  private readonly snapshot: TransactionsSnapshot = {
    metrics: [
      { label: 'Ingresos Totales', value: 3427, currency: 'USD', trend: '+12.5% vs último mes', isPositive: true },
      { label: 'Transacciones', value: 142, trend: '+4.3% vs último mes', isPositive: true },
      { label: 'Pedidos', value: 89, trend: '-3.1% vs último mes', isPositive: false },
      { label: 'Clientes Activos', value: 2543, trend: '+24.5% vs último mes', isPositive: true }
    ],
    transactions: [
      {
        id: 'tx-001',
        origin: 'Terceros',
        date: '2024-06-11',
        time: '14:32:15',
        description: 'Pila de Aizeskwork',
        platform: 'Twitch',
        amount: 20,
        fee: 2.5,
        status: 'Recibido',
        category: 'Suscripción/Donación',
        paymentMethod: 'Tarjeta de crédito',
        reference: 'REF-TWI-2024-06-11-142',
        customer: {
          name: 'Juan Pérez',
          email: 'juan.perez@email.com',
          id: 'CLI-00542'
        }
      },
      {
        id: 'tx-002',
        origin: 'Manual',
        date: '2024-06-10',
        time: '10:12:04',
        description: 'Ingreso por anuncios (Junio)',
        platform: 'YouTube',
        amount: 115,
        fee: 6.25,
        status: 'Pagado',
        category: 'Ingreso por Publicidad',
        manual: true,
        paymentMethod: 'Transferencia bancaria',
        reference: 'REF-YTB-2024-06-10-101',
        customer: {
          name: 'Agencia Creativa Gama',
          email: 'contacto@gama.agency',
          id: 'CLI-00211'
        }
      },
      {
        id: 'tx-003',
        origin: 'Terceros',
        date: '2024-06-09',
        time: '18:20:55',
        description: 'Pedido #52003 (Curso Online)',
        platform: 'Shopify',
        amount: 150,
        fee: 4.5,
        status: 'Procesando',
        category: 'Venta de Productos',
        paymentMethod: 'PayPal',
        reference: 'REF-SHY-2024-06-09-52003',
        customer: {
          name: 'Laura Gómez',
          email: 'laura.gomez@example.com',
          id: 'CLI-00087'
        }
      },
      {
        id: 'tx-004',
        origin: 'Manual',
        date: '2024-06-08',
        time: '09:45:01',
        description: 'Pedido #50108 (Libro Digital)',
        platform: 'Amazon',
        amount: 25,
        fee: 1.1,
        status: 'Completado',
        category: 'Venta de Productos',
        manual: true,
        paymentMethod: 'Transferencia bancaria',
        reference: 'REF-AMZ-2024-06-08-50108',
        customer: {
          name: 'Roberto Díaz',
          email: 'rdiaz@email.com',
          id: 'CLI-00151'
        }
      },
      {
        id: 'tx-005',
        origin: 'Terceros',
        date: '2024-06-07',
        time: '21:55:40',
        description: 'Suscripción de StreamerC',
        platform: 'Twitch',
        amount: 5,
        fee: 0.2,
        status: 'Recibido',
        category: 'Suscripción/Donación',
        paymentMethod: 'Pago en Twitch',
        reference: 'REF-TWI-2024-06-07-321',
        customer: {
          name: 'Streamer C',
          email: 'streamerc@live.com',
          id: 'CLI-00021'
        }
      },
      {
        id: 'tx-006',
        origin: 'Manual',
        date: '2024-06-06',
        time: '08:05:12',
        description: 'Ingreso por anuncios (Junio)',
        platform: 'YouTube',
        amount: 82.5,
        fee: 4.1,
        status: 'Pendiente',
        category: 'Ingreso por Publicidad',
        manual: true,
        paymentMethod: 'Transferencia bancaria',
        reference: 'REF-YTB-2024-06-06-082',
        customer: {
          name: 'Media Group Beta',
          email: 'finance@mediagroupbeta.com',
          id: 'CLI-00388'
        }
      },
      {
        id: 'tx-007',
        origin: 'Terceros',
        date: '2024-06-05',
        time: '16:43:29',
        description: 'Pedido #52005 (Servicio A)',
        platform: 'Shopify',
        amount: 200,
        fee: 9,
        status: 'Enviado',
        category: 'Venta de Productos',
        paymentMethod: 'PayPal',
        reference: 'REF-SHY-2024-06-05-52005',
        customer: {
          name: 'Carlos Ortega',
          email: 'cortega@example.com',
          id: 'CLI-00412'
        }
      },
      {
        id: 'tx-008',
        origin: 'Manual',
        date: '2024-06-04',
        time: '12:28:40',
        description: 'Pedido #50106 (Producto Z)',
        platform: 'Amazon',
        amount: 75,
        fee: 2.3,
        status: 'Completado',
        category: 'Venta de Productos',
        manual: true,
        paymentMethod: 'Transferencia bancaria',
        reference: 'REF-AMZ-2024-06-04-50106',
        customer: {
          name: 'Sara Molina',
          email: 'sara.molina@email.com',
          id: 'CLI-00176'
        }
      },
      {
        id: 'tx-009',
        origin: 'Terceros',
        date: '2024-06-03',
        time: '11:10:11',
        description: 'Donación de UsuarioE',
        platform: 'Twitch',
        amount: 10,
        fee: 0.5,
        status: 'Recibido',
        category: 'Suscripción/Donación',
        paymentMethod: 'Pago en Twitch',
        reference: 'REF-TWI-2024-06-03-110',
        customer: {
          name: 'Usuario E',
          email: 'user.e@example.com',
          id: 'CLI-00005'
        }
      },
      {
        id: 'tx-010',
        origin: 'Manual',
        date: '2024-06-02',
        time: '17:05:59',
        description: 'Pedido #52003 (ArtCraft Y)',
        platform: 'Shopify',
        amount: 125,
        fee: 5.7,
        status: 'Procesando',
        category: 'Venta de Productos',
        manual: true,
        paymentMethod: 'Transferencia bancaria',
        reference: 'REF-SHY-2024-06-02-52003',
        customer: {
          name: 'Marcos Ruiz',
          email: 'marcos.ruiz@example.com',
          id: 'CLI-00278'
        }
      }
    ],
    distribution: [
      { platform: 'Amazon', amount: 642, color: '#f97316' },
      { platform: 'Twitch', amount: 1390, color: '#a855f7' },
      { platform: 'Shopify', amount: 1045, color: '#22c55e' },
      { platform: 'YouTube', amount: 328, color: '#3b82f6' }
    ]
  };

  getSnapshot(): Observable<TransactionsSnapshot> {
    return of(this.snapshot);
  }

  getMetrics(): Observable<readonly TransactionMetric[]> {
    return of(this.snapshot.metrics);
  }

  getTransactions(): Observable<readonly DetailedTransaction[]> {
    return of(this.snapshot.transactions);
  }

  getDistribution(): Observable<readonly PlatformDistribution[]> {
    return of(this.snapshot.distribution);
  }

  getTransactionById(id: string): Observable<DetailedTransaction | undefined> {
    return of(this.snapshot.transactions.find((tx) => tx.id === id));
  }
}
