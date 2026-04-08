export interface User {
  id: number;
  nom: string;
  email: string;
  telephone?: string;
  role: 'admin' | 'lecteur';
  est_actif: boolean;
  derniere_connexion_at?: string;
  created_at?: string;
}

export interface Champ {
  id: number;
  user_id: number;
  nom: string;
  superficie_ha: number;
  localisation?: string;
  latitude?: number;
  longitude?: number;
  description?: string;
  est_actif: boolean;
  cultures_count?: number;
  created_at?: string;
  user?: User;
  cultures?: Culture[];
}

export interface Culture {
  id: number;
  champ_id: number;
  nom: string;
  variete?: string;
  saison: 'normale' | 'contre_saison';
  annee: number;
  date_semis?: string;
  date_recolte_prevue?: string;
  date_recolte_effective?: string;
  superficie_cultivee_ha?: number;
  quantite_recoltee_kg?: number;
  statut: 'en_cours' | 'recolte' | 'termine';
  notes?: string;
  champ?: Champ;
  medias?: Media[];
}

export interface Media {
  id: number;
  culture_id: number;
  type: 'photo' | 'video';
  fichier_url: string;
  fichier_nom: string;
  taille_octets?: number;
  description?: string;
  date_prise?: string;
}

export interface Intrant {
  id: number;
  nom: string;
  categorie: string;
  unite: string;
  description?: string;
  est_actif: boolean;
}

export interface Stock {
  id: number;
  user_id: number;
  intrant_id?: number;
  nom: string;
  categorie: string;
  quantite_actuelle: number;
  unite: string;
  seuil_alerte?: number;
  est_actif: boolean;
  intrant?: Intrant;
}

export interface MouvementStock {
  id: number;
  stock_id: number;
  type: 'achat' | 'utilisation' | 'perte' | 'ajustement';
  quantite: number;
  prix_unitaire_fcfa?: number;
  montant_total_fcfa?: number;
  fournisseur?: string;
  depense_id?: number;
  culture_id?: number;
  motif?: string;
  date_mouvement: string;
  culture?: Culture;
  depense?: Depense;
}

export interface Depense {
  id: number;
  user_id: number;
  champ_id?: number;
  categorie: string;
  description: string;
  montant_fcfa: number;
  date_depense: string;
  est_auto_generee: boolean;
  champ?: Champ;
}

export interface Vente {
  id: number;
  user_id: number;
  champ_id?: number;
  culture_id?: number;
  acheteur?: string;
  produit: string;
  quantite_kg: number;
  prix_unitaire_fcfa: number;
  montant_total_fcfa: number;
  date_vente: string;
  notes?: string;
  champ?: Champ;
  culture?: Culture;
}

export interface Employe {
  id: number;
  user_id: number;
  nom: string;
  telephone?: string;
  poste?: string;
  date_embauche?: string;
  salaire_mensuel_fcfa?: number;
  est_actif: boolean;
  notes?: string;
}

export interface Tache {
  id: number;
  employe_id: number;
  champ_id?: number;
  culture_id?: number;
  titre: string;
  description?: string;
  date_debut: string;
  date_fin?: string;
  statut: 'a_faire' | 'en_cours' | 'termine' | 'annule';
  priorite: 'basse' | 'normale' | 'haute' | 'urgente';
  employe?: Employe;
  champ?: Champ;
  culture?: Culture;
}

export interface PaiementSalaire {
  id: number;
  employe_id: number;
  montant_fcfa: number;
  mois: string;
  date_paiement: string;
  mode_paiement: 'especes' | 'mobile_money' | 'virement' | 'autre';
  notes?: string;
  depense_id?: number;
  employe?: Employe;
}

export interface UtilisationIntrant {
  id: number;
  culture_id: number;
  intrant_id?: number;
  stock_id?: number;
  nom_intrant: string;
  quantite: number;
  unite: string;
  cout_total_fcfa?: number;
  date_utilisation: string;
  notes?: string;
  intrant?: Intrant;
  stock?: Stock;
}

export interface DashboardKpis {
  total_ventes_fcfa: number;
  total_depenses_fcfa: number;
  solde_net_fcfa: number;
  nombre_champs: number;
  nombre_cultures_en_cours: number;
  nombre_employes_actifs: number;
  stocks_en_alerte: number;
}

export interface Financement {
  id: number;
  employe_id: number;
  user_id: number;
  montant_fcfa: number;
  motif?: string;
  date_financement: string;
  mode_paiement: 'especes' | 'mobile_money' | 'virement' | 'autre';
  notes?: string;
  depense_id?: number;
  montant_rembourse_fcfa: number;
  statut: 'en_cours' | 'partiel' | 'rembourse';
  employe?: Employe;
  depense?: Depense;
  remboursements?: RemboursementFinancement[];
}

export interface RemboursementFinancement {
  id: number;
  financement_id: number;
  montant_fcfa: number;
  date_remboursement: string;
  mode_paiement: 'especes' | 'mobile_money' | 'virement' | 'autre';
  notes?: string;
  vente_id?: number;
}

export interface FinanceResume {
  total_ventes_fcfa: number;
  total_depenses_fcfa: number;
  solde_net_fcfa: number;
  nombre_ventes: number;
  nombre_depenses: number;
  date_debut: string;
  date_fin: string;
}

export const CATEGORIES_DEPENSES = [
  { value: 'intrant', label: 'Intrant' },
  { value: 'salaire', label: 'Salaire' },
  { value: 'materiel', label: 'Matériel' },
  { value: 'autre', label: 'Autre' },
  { value: 'carburant', label: 'Carburant' },
  { value: 'main_oeuvre', label: "Main d'oeuvre" },
  { value: 'traitement_phytosanitaire', label: 'Traitement phytosanitaire' },
  { value: 'transport', label: 'Transport' },
  { value: 'irrigation', label: 'Irrigation' },
  { value: 'entretien_materiel', label: 'Entretien matériel' },
  { value: 'alimentation_betail', label: 'Alimentation bétail' },
  { value: 'frais_recolte', label: 'Frais récolte' },
  { value: 'financement_individuel', label: 'Financement individuel' },
];
