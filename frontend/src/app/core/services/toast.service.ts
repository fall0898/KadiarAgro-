import { Injectable, signal } from '@angular/core';

export interface Toast {
  id: number;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  toasts = signal<Toast[]>([]);
  private counter = 0;

  show(type: Toast['type'], message: string): void {
    const id = ++this.counter;
    this.toasts.update(t => [...t, { id, type, message }]);
    setTimeout(() => this.remove(id), 4000);
  }

  success(message: string): void { this.show('success', message); }
  error(message: string): void { this.show('error', message); }
  warning(message: string): void { this.show('warning', message); }
  info(message: string): void { this.show('info', message); }

  remove(id: number): void {
    this.toasts.update(t => t.filter(toast => toast.id !== id));
  }
}
