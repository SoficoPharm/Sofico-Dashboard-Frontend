import { Component, Output, EventEmitter, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BranchMappingService, Branch } from '../../../services/branch-mapping.service';

@Component({
  selector: 'app-branch-filter',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './branch-filter.component.html',
  styleUrls: ['./branch-filter.component.scss']
})
export class BranchFilterComponent implements OnInit {
  @Input() selectedBranchCode: string | null = null;
  @Output() branchChange = new EventEmitter<string | null>();
  @Output() branchNameChange = new EventEmitter<string>();

  branches: Branch[] = [];
  isLoading = false;
  error: string | null = null;

  constructor(private branchMappingService: BranchMappingService) {}

  ngOnInit(): void {
    this.loadBranches();

    // ✅ optional: keep UI synced with cache changes
    this.branchMappingService.getAllBranches().subscribe(b => {
      if (b && b.length) this.branches = b;
    });
  }

  loadBranches(): void {
    this.isLoading = true;
    this.error = null;

    this.branchMappingService.loadBranches().subscribe({
      next: (branches) => {
        this.branches = branches;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('❌ Error Loading Branches:', err);
        this.error = 'Failed to load branches';
        this.isLoading = false;
      }
    });
  }

  onBranchChange(event: any): void {
    const branchCode = event.target.value === 'all' ? null : event.target.value;
    this.selectedBranchCode = branchCode;

    this.branchChange.emit(branchCode);

    const branchName = branchCode
      ? this.branches.find(b => b.branchCode === branchCode)?.branchName || ''
      : '';

    this.branchNameChange.emit(branchName);
  }

  refreshBranches(): void {
    this.branchMappingService.refreshBranches().subscribe({
      next: (branches) => {
        this.branches = branches;
      },
      error: (err) => {
        console.error('❌ Error refreshing branches:', err);
        this.error = 'Failed to refresh branches';
      }
    });
  }
}
