import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class UiLoadingService {
  private readonly _loading = new BehaviorSubject<boolean>(false);
  readonly loading$: Observable<boolean> = this._loading.asObservable();

  get isLoading(): boolean {
    return this._loading.value;
  }

  start(): void {
    this._loading.next(true);
  }

  stop(): void {
    this._loading.next(false);
  }

  runWithLock<T>(source$: Observable<T>): Observable<T> {
    if (this.isLoading) {
      throw new Error('Request already in progress');
    }

    this.start();
    return source$.pipe(
      finalize(() => this.stop())
    );
  }
}