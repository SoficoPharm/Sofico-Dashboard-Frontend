import { Injectable } from '@angular/core';
import { BehaviorSubject, Subscription } from 'rxjs';
import { SignalRService, SyncNotification } from './signalr';
import { BranchMappingService } from '../features/dashboard/services/branch-mapping.service';

@Injectable({ providedIn: 'root' })
export class SyncBusService {
  public lastSync$ = new BehaviorSubject<string>('Waiting for sync...');
  public syncing$ = new BehaviorSubject<boolean>(false);

  private initialized = false;

  private subStarted?: Subscription;
  private subCompleted?: Subscription;
  private subFailed?: Subscription;

  constructor(
    private signalR: SignalRService,
    private branchMapping: BranchMappingService
  ) {}

  init(): void {
    if (this.initialized) return;
    this.initialized = true;

    // ✅ open SignalR once
    this.signalR.startConnection()
      .then(() => {
        // ✅ started
        this.subStarted = this.signalR.syncStarted$.subscribe(() => {
          this.syncing$.next(true);
        });

        // ✅ completed
        this.subCompleted = this.signalR.syncCompleted$.subscribe((n: SyncNotification) => {
          this.syncing$.next(false);

          if (n?.syncTime) {
            this.lastSync$.next(n.syncTime);
          }

          // ✅ refresh branches cache after sync
          this.branchMapping.refreshBranches().subscribe();
        });

        // ✅ failed
        this.subFailed = this.signalR.syncFailed$.subscribe(() => {
          this.syncing$.next(false);
        });
      })
      .catch(() => {
        // SignalRService has retry already
      });
  }

  destroy(): void {
    this.subStarted?.unsubscribe();
    this.subCompleted?.unsubscribe();
    this.subFailed?.unsubscribe();
  }
}
