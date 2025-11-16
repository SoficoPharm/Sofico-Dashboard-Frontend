import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

interface MenuItem {
    icon: string;
    label: string;
    route?: string;
    badge?: string;
    children?: MenuItem[];
}

@Component({
    selector: 'app-sidebar',
    standalone: true,
    imports: [CommonModule, RouterModule],
    templateUrl: './sidebar.component.html',
    styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {
    isCollapsed = true;
    currentUser: any = null;
 activeMenu: string | null = null;
    menuItems: MenuItem[] = [
        {
            icon: '📊',
            label: 'Sofico Dashboard',
            route: '/dashboard',
            badge: 'new'
        },
        {
            icon: '📱',
            label: 'B2B Application',
            route: '/b2b',
            badge: 'new'
        },
        {
            icon: '🔄',
            label: 'Routing Team',
            route: '/routing',
            badge: 'new'
        },
        {
            icon: '📄',
            label: 'Reports',
            route: '/reports',
            badge: 'new'
        },
        {
            icon: '🛒',
            label: 'orders-DRM',
            route: '/orders-drm',
            badge: 'new'
        },
        {
            icon: '📊',
            label: 'DoctorM Dashboard',
            route: '/doctor-dashboard',
            badge: 'new'
        },
        {
            icon: '🎫',
            label: 'Ticketing',
            route: '/ticketing',
            badge: 'new'
        },
        {
            icon: '📞',
            label: 'CRM Calls',
            route: '/crm-calls',
            badge: 'new'
        },
        {
            icon: '📋',
            label: 'CRM Auditing',
            route: '/crm-auditing',
            badge: 'new'
        },
        {
            icon: '🎓',
            label: 'Courses',
            route: '/courses',
            badge: 'new'
        },
        {
            icon: '💰',
            label: 'Sales',
            route: '/sales',
            children: [
                { icon: '', label: 'Details', route: '/sales/details' },
                { icon: '', label: 'Reports', route: '/sales/reports' }
            ]
        },
    ];

    ngOnInit(): void {
        this.loadUser();
    }

    loadUser(): void {
        const userStr = localStorage.getItem('currentUser');
         if (userStr) {
            this.currentUser = JSON.parse(userStr);
        } else {
            this.currentUser = null;
        }
    }

    toggleSidebar(): void {
        this.isCollapsed = !this.isCollapsed;
    }
    
    toggleMenu(label: string): void {
        this.activeMenu = this.activeMenu === label ? null : label;
    }
}