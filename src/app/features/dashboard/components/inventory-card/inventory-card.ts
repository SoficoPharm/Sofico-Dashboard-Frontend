// inventory-card.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardService } from '../../services/dashboard.service';
import { InventoryWidgetResponse } from '../../models/dashboard.model';

@Component({
  selector: 'app-inventory-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './inventory-card.html',
  styleUrls: ['./inventory-card.scss']
})
export class InventoryCardComponent implements OnInit {

  loading = false;

  inventoryData: InventoryWidgetResponse = {
    retail: 0,
    hospital: 0,
    cosmetics: 0,
    sd: 0,

    mainStore: 0,
    rawMat: 0,
    tender: 0,

    damage: 0,
    expiredStorage: 0,
    noTrade: 0,
    stockInTransit: 0,

    normal: 0,
    expired: 0,

    totalStock: 0
  };

  constructor(
    private dashboardService: DashboardService
  ) {}

  ngOnInit(): void {
    this.loadInventory();
  }

  loadInventory(): void {

    this.loading = true;

    this.dashboardService
      .getInventoryWidget()
      .subscribe({
        next: (data: InventoryWidgetResponse) => {

          console.log('Inventory API Response:', data);

          this.inventoryData = data;

          this.loading = false;
        },

        error: (err) => {

          console.error('Inventory Error:', err);

          this.loading = false;
        }
      });
  }

  formatNumber(value: number): string {
    return Number(value || 0).toLocaleString('en-US');
  }
}