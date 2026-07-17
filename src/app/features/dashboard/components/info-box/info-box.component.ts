import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { SyncBusService } from '../../../../services/sync-bus';

@Component({
  selector: 'app-info-box',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './info-box.component.html',
  styleUrls: ['./info-box.component.scss']
})
export class InfoBoxComponent implements OnInit, OnDestroy {
  version = '20.3.10';
  currentDay = '';
  currentTime = '';
  lastSync = 'Waiting for sync...';

  signalRConnected = false;

  private subLastSync?: Subscription;
  private subSyncing?: Subscription;

  constructor(private syncBus: SyncBusService) {}

  ngOnInit(): void {
    this.updateDateTime();

    this.subLastSync = this.syncBus.lastSync$.subscribe(v => {
      this.lastSync = v;
      this.signalRConnected = true;
      this.updateDateTime();
    });

    this.subSyncing = this.syncBus.syncing$.subscribe(() => {
      this.signalRConnected = true;
    });
  }

  ngOnDestroy(): void {
    this.subLastSync?.unsubscribe();
    this.subSyncing?.unsubscribe();
  }

  updateDateTime(): void {
    const now = new Date();
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    this.currentDay = days[now.getDay()];
    this.currentTime = now.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
  }
}
