import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { Employe, PaiementSalaire, Financement } from '../../core/models';
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
          <button (click)="activeTab.set('paiements')" class="px-4 py-2 text-sm font-medium border-b-2 transition-colors" [class]="activeTab() === 'paiements' ? 'border-primary-500 text-primary-700' : 'border-transparent text-neutral-500'">Paiements</button>
          <button (click)="activeTab.set('financements')" class="px-4 py-2 text-sm font-medium border-b-2 transition-colors" [class]="activeTab() === 'financements' ? 'border-primary-500 text-primary-700' : 'border-transparent text-neutral-500'">Financements</button>
        </div>

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

        @if (activeTab() === 'financements') {
          @if (auth.isAdmin()) {
            <div class="bg-white rounded-lg shadow-sm p-4 mb-4">
              <h3 class="font-semibold text-sm text-neutral-700 mb-3">Accorder un financement</h3>
              <form [formGroup]="financementForm" (ngSubmit)="accorderFinancement()" class="grid grid-cols-2 md:grid-cols-3 gap-3">
                <input type="number" formControlName="montant_fcfa" placeholder="Montant FCFA *" class="px-3 py-2 border border-neutral-300 rounded-md text-sm" />
                <input type="date" formControlName="date_financement" class="px-3 py-2 border border-neutral-300 rounded-md text-sm" />
                <select formControlName="mode_paiement" class="px-3 py-2 border border-neutral-300 rounded-md text-sm">
                  <option value="especes">Espèces</option>
                  <option value="mobile_money">Mobile Money</option>
                  <option value="virement">Virement</option>
                  <option value="autre">Autre</option>
                </select>
                <input type="text" formControlName="motif" placeholder="Motif (optionnel)" class="px-3 py-2 border border-neutral-300 rounded-md text-sm md:col-span-2" />
                <div class="flex justify-end">
                  <button type="submit" class="w-full px-4 py-2 bg-primary-600 text-white rounded-md text-sm font-medium hover:bg-primary-700">Accorder</button>
                </div>
              </form>
            </div>
          }

          <div class="space-y-3">
            @for (f of financements(); track f.id) {
              <div class="bg-white rounded-lg shadow-sm overflow-hidden">
                <div class="px-4 py-3 flex items-center gap-4 cursor-pointer hover:bg-neutral-50" (click)="toggleFinancement(f.id)">
                  <div class="flex-1">
                    <p class="text-sm font-semibold">{{ f.montant_fcfa | currencyFcfa }}</p>
                    <p class="text-xs text-neutral-400">{{ f.motif || 'Sans motif' }} · {{ f.date_financement | dateFr }}</p>
                  </div>
                  <div class="text-right">
                    <p class="text-xs text-neutral-500">Remboursé : <span class="font-medium text-neutral-700">{{ f.montant_rembourse_fcfa | currencyFcfa }}</span></p>
                    <span class="text-xs px-2 py-0.5 rounded-full" [class]="f.statut === 'rembourse' ? 'bg-green-100 text-green-700' : f.statut === 'partiel' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'">
                      {{ f.statut === 'rembourse' ? 'Remboursé' : f.statut === 'partiel' ? 'Partiel' : 'En cours' }}
                    </span>
                  </div>
                  @if (auth.isAdmin() && f.statut !== 'rembourse') {
                    <span class="text-xs text-primary-600 underline ml-2">+ Remb.</span>
                  }
                </div>

                @if (expandedFinancement() === f.id) {
                  <div class="border-t border-neutral-100 px-4 py-3 bg-neutral-50">
                    @if (auth.isAdmin() && f.statut !== 'rembourse') {
                      <form [formGroup]="remboursementForm" (ngSubmit)="ajouterRemboursement(f.id)" class="flex gap-2 mb-3">
                        <input type="number" formControlName="montant_fcfa" placeholder="Montant remboursé *" class="px-3 py-1.5 border border-neutral-300 rounded-md text-sm flex-1" />
                        <input type="date" formControlName="date_remboursement" class="px-3 py-1.5 border border-neutral-300 rounded-md text-sm" />
                        <select formControlName="mode_paiement" class="px-3 py-1.5 border border-neutral-300 rounded-md text-sm">
                          <option value="especes">Espèces</option>
                          <option value="mobile_money">Mobile Money</option>
                          <option value="virement">Virement</option>
                          <option value="autre">Autre</option>
                        </select>
                        <button type="submit" class="px-3 py-1.5 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700 whitespace-nowrap">Enregistrer</button>
                      </form>
                    }
                    @if (f.remboursements && f.remboursements.length > 0) {
                      <p class="text-xs font-medium text-neutral-500 uppercase mb-2">Remboursements</p>
                      <div class="space-y-1">
                        @for (r of f.remboursements; track r.id) {
                          <div class="flex items-center justify-between text-sm">
                            <span class="text-neutral-600">{{ r.date_remboursement | dateFr }}</span>
                            <span class="font-semibold text-green-700">+{{ r.montant_fcfa | currencyFcfa }}</span>
                            <span class="text-xs text-neutral-400 capitalize">{{ r.mode_paiement }}</span>
                          </div>
                        }
                      </div>
                    } @else {
                      <p class="text-xs text-neutral-400">Aucun remboursement enregistré.</p>
                    }
                  </div>
                }
              </div>
            }
            @empty {
              <p class="py-8 text-center text-sm text-neutral-400">Aucun financement accordé</p>
            }
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
paiements = signal<PaiementSalaire[]>([]);
  financements = signal<Financement[]>([]);
  activeTab = signal<'paiements' | 'financements'>('paiements');
  expandedFinancement = signal<number | null>(null);

  financementForm = this.fb.group({
    montant_fcfa: [null as number | null, [Validators.required, Validators.min(1)]],
    date_financement: [new Date().toISOString().split('T')[0], Validators.required],
    mode_paiement: ['especes'],
    motif: [''],
  });

  remboursementForm = this.fb.group({
    montant_fcfa: [null as number | null, [Validators.required, Validators.min(1)]],
    date_remboursement: [new Date().toISOString().split('T')[0], Validators.required],
    mode_paiement: ['especes'],
  });

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
this.api.get<PaiementSalaire[]>(`employes/${this.employeId}/paiements`).subscribe(d => this.paiements.set(d));
    this.api.get<Financement[]>(`employes/${this.employeId}/financements`).subscribe(d => this.financements.set(d));
  }

  toggleFinancement(id: number): void {
    this.expandedFinancement.set(this.expandedFinancement() === id ? null : id);
    // Reset remboursement form when opening a new financement
    this.remboursementForm.reset({ date_remboursement: new Date().toISOString().split('T')[0], mode_paiement: 'especes' });
  }

  accorderFinancement(): void {
    if (this.financementForm.invalid) { this.financementForm.markAllAsTouched(); return; }
    this.api.post('financements', { ...this.financementForm.value, employe_id: this.employeId }).subscribe({
      next: () => {
        this.toast.success('Financement accordé. Dépense créée automatiquement.');
        this.financementForm.reset({ date_financement: new Date().toISOString().split('T')[0], mode_paiement: 'especes' });
        this.api.get<Financement[]>(`employes/${this.employeId}/financements`).subscribe(d => this.financements.set(d));
      },
    });
  }

  ajouterRemboursement(financementId: number): void {
    if (this.remboursementForm.invalid) { this.remboursementForm.markAllAsTouched(); return; }
    this.api.post(`financements/${financementId}/remboursements`, this.remboursementForm.value).subscribe({
      next: () => {
        this.toast.success('Remboursement enregistré. Recette ajoutée au finance.');
        this.remboursementForm.reset({ date_remboursement: new Date().toISOString().split('T')[0], mode_paiement: 'especes' });
        this.api.get<Financement[]>(`employes/${this.employeId}/financements`).subscribe(d => this.financements.set(d));
      },
    });
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
