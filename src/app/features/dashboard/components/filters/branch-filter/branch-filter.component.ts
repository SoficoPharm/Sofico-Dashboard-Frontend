import { Component, Output, EventEmitter, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DashboardService } from '../../../services/dashboard.service';
import { Branch } from '../../../models/dashboard.model';

@Component({
  selector: 'app-branch-filter',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './branch-filter.component.html',
  styleUrls: ['./branch-filter.component.scss']
})
export class BranchFilterComponent implements OnInit {
  @Input() selectedBranchId: string | null = null;
  @Output() branchChange = new EventEmitter<string | null>();

  branches: Branch[] = [];

  constructor(private dashboardService: DashboardService) {}

  ngOnInit(): void {
    this.loadBranches();
  }

  loadBranches(): void {
    this.dashboardService.getBranches().subscribe(branches => {
      this.branches = branches;
    });
  }

  onBranchChange(event: any): void {
    const branchId = event.target.value === 'all' ? null : event.target.value;
    this.selectedBranchId = branchId;
    this.branchChange.emit(branchId);
  }
}