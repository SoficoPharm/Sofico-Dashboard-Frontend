import { Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { Subject, BehaviorSubject } from 'rxjs';
import { environment } from './../../environments/environment';

export interface SyncNotification {
  success: boolean;
  totalRecords?: number;
  batchId?: string;
  syncTime: string;
  duration?: number;
  message: string;
  error?: string;
  startTime?: string;
}

@Injectable({ providedIn: 'root' })
export class SignalRService {
  private hubConnection?: signalR.HubConnection;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  // ✅ prevent multiple start() calls
  private connectionPromise?: Promise<void>;

  public syncStarted$ = new Subject<SyncNotification>();
  public syncCompleted$ = new Subject<SyncNotification>();
  public syncFailed$ = new Subject<SyncNotification>();

  public connectionState$ = new BehaviorSubject<signalR.HubConnectionState>(
    signalR.HubConnectionState.Disconnected
  );

  private readonly hubUrl = environment.signalRUrl;

  constructor() {
    console.log('🔌 SignalR Service Initialized');
    console.log('📡 Hub URL:', this.hubUrl);
  }

  public startConnection(): Promise<void> {
    if (this.hubConnection?.state === signalR.HubConnectionState.Connected) {
      return Promise.resolve();
    }

    // ✅ return same promise if already connecting
    if (this.connectionPromise) {
      return this.connectionPromise;
    }

    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(this.hubUrl, {
        skipNegotiation: false,
        transport:
          signalR.HttpTransportType.WebSockets |
          signalR.HttpTransportType.ServerSentEvents |
          signalR.HttpTransportType.LongPolling
      })
      .withAutomaticReconnect([0, 1000, 2000, 5000, 10000])
      .configureLogging(signalR.LogLevel.Warning)
      .build();

    this.setupEventHandlers();
    this.registerMessageHandlers();

    this.connectionPromise = this.hubConnection
      .start()
      .then(() => {
        console.log('✅ SignalR CONNECTED', this.hubConnection?.connectionId);
        this.connectionState$.next(signalR.HubConnectionState.Connected);
        this.reconnectAttempts = 0;
      })
      .catch(err => {
        console.error('❌ SignalR FAILED:', err?.message || err);
        this.connectionState$.next(signalR.HubConnectionState.Disconnected);

        // ✅ allow next retry
        this.connectionPromise = undefined;

        if (this.reconnectAttempts < this.maxReconnectAttempts) {
          this.reconnectAttempts++;
          const delay = 2000 * this.reconnectAttempts;
          setTimeout(() => this.startConnection(), delay);
        }

        throw err;
      });

    return this.connectionPromise;
  }

  private setupEventHandlers(): void {
    if (!this.hubConnection) return;

    this.hubConnection.onreconnecting(() => {
      this.connectionState$.next(signalR.HubConnectionState.Reconnecting);
    });

    this.hubConnection.onreconnected(() => {
      this.connectionState$.next(signalR.HubConnectionState.Connected);
      this.reconnectAttempts = 0;
    });

    this.hubConnection.onclose(() => {
      this.connectionState$.next(signalR.HubConnectionState.Disconnected);
      this.connectionPromise = undefined;

      setTimeout(() => this.startConnection(), 3000);
    });
  }

  private registerMessageHandlers(): void {
    if (!this.hubConnection) return;

    this.hubConnection.on('SyncStarted', (data: any) => {
      this.syncStarted$.next({
        success: true,
        syncTime: data?.startTime || new Date().toISOString(),
        message: data?.message || 'Sync started',
        startTime: data?.startTime
      });
    });

    this.hubConnection.on('SyncCompleted', (data: any) => {
      this.syncCompleted$.next({
        success: data?.success || false,
        totalRecords: data?.totalRecords || 0,
        batchId: data?.batchId || '',
        syncTime: data?.syncTime || new Date().toISOString(),
        duration: data?.duration || 0,
        message: data?.message || 'Sync completed'
      });
    });

    this.hubConnection.on('SyncFailed', (data: any) => {
      this.syncFailed$.next({
        success: false,
        syncTime: data?.syncTime || new Date().toISOString(),
        duration: data?.duration || 0,
        message: data?.message || 'Sync failed',
        error: data?.error
      });
    });

    this.hubConnection.on('Connected', () => {});
  }
}
