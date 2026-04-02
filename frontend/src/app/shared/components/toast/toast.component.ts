import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full">
      @for (toast of toastService.toasts(); track toast.id) {
        <div class="flex items-start gap-3 px-4 py-3 rounded-lg shadow-lg border-l-4 bg-white animate-fade-in"
          [class]="getBorderClass(toast.type)">
          <span class="text-lg flex-shrink-0">{{ getIcon(toast.type) }}</span>
          <p class="text-sm text-neutral-700 flex-1">{{ toast.message }}</p>
          <button (click)="toastService.remove(toast.id)" class="text-neutral-400 hover:text-neutral-600 text-lg leading-none flex-shrink-0">&times;</button>
        </div>
      }
    </div>
  `,
})
export class ToastComponent {
  toastService = inject(ToastService);

  getBorderClass(type: string): string {
    const map: Record<string, string> = {
      success: 'border-primary-500',
      error: 'border-error',
      warning: 'border-warning',
      info: 'border-info',
    };
    return map[type] || 'border-neutral-300';
  }

  getIcon(type: string): string {
    const map: Record<string, string> = { success: '✓', error: '✕', warning: '⚠', info: 'ℹ' };
    return map[type] || '•';
  }
}
