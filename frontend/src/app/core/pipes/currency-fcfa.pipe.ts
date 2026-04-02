import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'currencyFcfa', standalone: true })
export class CurrencyFcfaPipe implements PipeTransform {
  transform(value: number | null | undefined): string {
    if (value === null || value === undefined) return '0 FCFA';
    return new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(value) + ' FCFA';
  }
}
