import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { Employe, Tache, PaiementSalaire } from '../../core/models';
import { DateFrPipe } from '../../core/pipes/date-fr.pipe';
import { CurrencyFcfaPipe } from '../../core/pipes/currency-fcfa.pipe';

@Component({
  selector: 'app-fiche-employe',
  standalone: true,
  imports: [CommonModule, RouterLink, DateFrPipe, CurrencyFcfaPipe, ReactiveFormsModule],
  template: `
    <div class="max-w-5xl mx-auto">
      <div class="flex items-center gap-3 mb-6">
        <a routerLink="/app/employes" class="text-neutral-400 hover:text-neutral-600 text-sm">← Employés</a>
        <span class="text-neutral-300">/</span>
        <h1 class="text-xl font-bold text-neutral-800">{{ employe()?.nom }}</h1>
        @if (auth.isAdmin() && employe()) {
          <a [routerLink]="['/app/employes', employe()!.id, 'modifier']" class="ml-auto text-sm border border-neutral-300 text-neutral-600 px-3 py-1.5 rounded-md hover:bg-neutral-50">Modifier</a>
        }
      </div>

      @if (employe()) {
        <div class="bg-white rounded-lg shadow-sm p-5 mb-6">
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div><p class="text-xs text-neutral-500">Poste</p><p class="font-semibold">{{ employe()!.poste || '-' }}</p></div>
            <div><p class="text-xs text-neutral-500">Téléphone</p><p class="font-semibold">{{ employe()!.telephone || '-' }}</p></div>
            <div><p class="text-xs text-neutral-500">Salaire mensuel</p><p class="font-semibold">{{ employe()!.salaire_mensuel_fcfa | currencyFcfa }}</p></div>
            <div><p class="text-xs text-neutral-500">Statut</p>
              <span class="text-xs px-2 py-0.5 rounded-full" [class]="employe()!.est_actif ? 'bg-primary-100 text-primary-700' : 'bg-neutral-200 text-neutral-500'">
                {{ employe()!.est_actif ? 'Actif' : 'Inactif' }}
              </span>
            </div>
          </div>
        </div>

        <!-- Tabs -->
        <div class="flex border-b border-neutral-200 mb-4">
          <button (click)="activeTab.set('taches')" class="px-4 py-2 text-sm font-medium border-b-2 transition-colors" [class]="activeTab() === 'taches' ? 'border-primary-500 text-primary-700' : 'border-transparent text-neutral-500'">Tâches</button>
          <button (click)="activeTab.set('paiements')" class="px-4 py-2 text-sm font-medium border-b-2 transition-colors" [class]="activeTab() === 'paiements' ? 'border-primary-500 text-primary-700' : 'border-transparent text-neutral-500'">Paiements</button>
        </div>

        @if (activeTab() === 'taches') {
          <div class="bg-white rounded-lg shadow-sm divide-y divide-neutral-100">
            @for (t of taches(); track t.id) {
              <div class="px-4 py-3 flex items-center gap-4">
                <div class="flex-1">
                  <p class="text-sm font-medium">{{ t.titre }}</p>
                  <p class="text-xs text-neutral-400">{{ t.champ?.nom || '-' }} • {{ t.date_debut | dateFr }}</p>
                </div>
                <span class="text-xs px-2 py-0.5 rounded-full" [class]="t.statut === 'en_cours' ? 'bg-primary-100 text-primary-700' : t.statut === 'termine' ? 'bg-neutral-100 text-neutral-600' : 'bg-accent-100 text-accent-700'">{{ t.statut }}</span>
              </div>
            }
            @empty { <p class="py-8 text-center text-sm text-neutral-400">Aucune tâche</p> }
          </div>
        }

        @if (activeTab() === 'paiements') {
          @if (auth.isAdmin()) {
            <div class="bg-white rounded-lg shadow-sm p-4 mb-4">
              <h3 class="font-semibold text-sm text-neutral-700 mb-3">Enregistrer un paiement</h3>
              <form [formGroup]="paiementForm" (ngSubmit)="enregistrerPaiement()" class="grid grid-cols-2 md:grid-cols-4 gap-3">
                <input type="number" formControlName="montant_fcfa" placeholder="Montant FCFA *" class="px-3 py-2 border border-neutral-300 rounded-md text-sm" />
                <input type="month" formControlName="mois" placeholder="Mois (YYYY-MM) *" class="px-3 py-2 border border-neutral-300 rounded-md text-sm" />
                <input type="date" formControlName="date_paiement" class="px-3 py-2 border border-neutral-300 rounded-md text-sm" />
                <select formControlName="mode_paiement" class="px-3 py-2 border border-neutral-300 rounded-md text-sm">
                  <option value="especes">Espèces</option>
                  <option value="mobile_money">Mobile Money</option>
                  <option value="virement">Virement</option>
                  <option value="autre">Autre</option>
                </select>
                <div class="md:col-span-4 flex justify-end">
                  <button type="submit" class="px-4 py-2 bg-primary-600 text-white rounded-md text-sm font-medium hover:bg-primary-700">Enregistrer</button>
                </div>
              </form>
            </div>
          }
          <div class="bg-white rounded-lg shadow-sm overflow-hidden">
            <table class="w-full">
              <thead><tr class="bg-neutral-100"><th class="px-4 py-3 text-left text-xs text-neutral-500 uppercase">Mois</th><th class="px-4 py-3 text-right text-xs text-neutral-500 uppercase">Montant</th><th class="px-4 py-3 text-left text-xs text-neutral-500 uppercase">Mode</th><th class="px-4 py-3 text-left text-xs text-neutral-500 uppercase hidden sm:table-cell">Date</th></tr></thead>
              <tbody class="divide-y divide-neutral-100">
                @for (p of paiements(); track p.id) {
                  <tr class="hover:bg-neutral-50">
                    <td class="px-4 py-3 text-sm font-medium">{{ p.mois }}</td>
                    <td class="px-4 py-3 text-sm font-semibold text-right text-primary-600">{{ p.montant_fcfa | currencyFcfa }}</td>
                    <td class="px-4 py-3 text-sm text-neutral-500 capitalize">{{ p.mode_paiement }}</td>
                    <td class="px-4 py-3 text-sm text-neutral-500 hidden sm:table-cell">{{ p.date_paiement | dateFr }}</td>
                  </tr>
                }
                @empty { <tr><td colspan="4" class="py-8 text-center text-sm text-neutral-400">Aucun paiement</td></tr> }
              </tbody>
            </table>
          </div>
        }
      }
    </div>
  `,
})
export class FicheEmployeComponent implements OnInit {
  private api = inject(ApiService);
  private route = inject(ActivatedRoute);
  private fb = inject(FormBuilder);
  private toast = inject(ToastService);
  auth = inject(AuthService);

  employe = signal<Employe | null>(null);
  taches = signal<Tache[]>([]);
  paiements = signal<PaiementSalaire[]>([]);
  activeTab = signal<'taches' | 'paiements'>('taches');

  paiementForm = this.fb.group({
    montant_fcfa: [null as number | null, [Validators.required, Validators.min(0)]],
    mois: ['', Validators.required],
    date_paiement: [new Date().toISOString().split('T')[0], Validators.required],
    mode_paiement: ['especes'],
    notes: [''],
  });

  private employeId!: number;

  ngOnInit(): void {
    this.employeId = +this.route.snapshot.paramMap.get('id')!;
    this.api.get<Employe>(`employes/${this.employeId}`).subscribe(e => this.employe.set(e));
    this.api.get<Tache[]>(`employes/${this.employeId}/taches`).subscribe(d => this.taches.set(d));
    this.api.get<PaiementSalaire[]>(`employes/${this.employeId}/paiements`).subscribe(d => this.paiements.set(d));
  }

  enregistrerPaiement(): void {
    if (this.paiementForm.invalid) { this.paiementForm.markAllAsTouched(); return; }
    const val = this.paiementForm.value;
    const mois = (val.mois as string)?.substring(0, 7);
    this.api.post('salaires', { ...val, mois, employe_id: this.employeId }).subscribe({
      next: () => {
        this.toast.success('Paiement enregistré. Dépense créée automatiquement.');
        this.paiementForm.reset({ date_paiement: new Date().toISOString().split('T')[0], mode_paiement: 'especes' });
        this.api.get<PaiementSalaire[]>(`employes/${this.employeId}/paiements`).subscribe(d => this.paiements.set(d));
      },
    });
  }
}
