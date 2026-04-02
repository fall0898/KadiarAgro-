<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Champ;
use App\Models\Culture;
use App\Models\Depense;
use App\Models\Vente;
use Illuminate\Http\Request;
use Maatwebsite\Excel\Facades\Excel;
use App\Exports\FinanceExport;

class FinanceController extends Controller
{
    private function getDateRange(Request $request): array
    {
        $now = now();
        $month = $now->month;
        $year = $now->year;
        // Campagne agricole : octobre → septembre
        if ($month >= 10) {
            $debutDefaut = "{$year}-10-01";
            $finDefaut   = ($year + 1) . "-09-30";
        } else {
            $debutDefaut = ($year - 1) . "-10-01";
            $finDefaut   = "{$year}-09-30";
        }
        return [
            'debut' => $request->date_debut ?? $debutDefaut,
            'fin'   => $request->date_fin   ?? $finDefaut,
        ];
    }

    public function resume(Request $request)
    {
        ['debut' => $debut, 'fin' => $fin] = $this->getDateRange($request);

        $totalVentes = Vente::whereBetween('date_vente', [$debut, $fin])->sum('montant_total_fcfa');
        $totalDepenses = Depense::whereBetween('date_depense', [$debut, $fin])->sum('montant_fcfa');
        $nbVentes = Vente::whereBetween('date_vente', [$debut, $fin])->count();
        $nbDepenses = Depense::whereBetween('date_depense', [$debut, $fin])->count();

        return response()->json([
            'total_ventes_fcfa' => $totalVentes,
            'total_depenses_fcfa' => $totalDepenses,
            'solde_net_fcfa' => $totalVentes - $totalDepenses,
            'nombre_ventes' => $nbVentes,
            'nombre_depenses' => $nbDepenses,
            'date_debut' => $debut,
            'date_fin' => $fin,
        ]);
    }

    public function parChamp(Request $request)
    {
        ['debut' => $debut, 'fin' => $fin] = $this->getDateRange($request);

        $champs = Champ::all();
        $result = $champs->map(function ($champ) use ($debut, $fin) {
            $ventes = Vente::where('champ_id', $champ->id)->whereBetween('date_vente', [$debut, $fin])->sum('montant_total_fcfa');
            $depenses = Depense::where('champ_id', $champ->id)->whereBetween('date_depense', [$debut, $fin])->sum('montant_fcfa');
            return [
                'champ_id' => $champ->id,
                'champ_nom' => $champ->nom,
                'total_ventes_fcfa' => $ventes,
                'total_depenses_fcfa' => $depenses,
                'solde_net_fcfa' => $ventes - $depenses,
            ];
        });

        return response()->json($result);
    }

    public function parCulture(Request $request)
    {
        ['debut' => $debut, 'fin' => $fin] = $this->getDateRange($request);

        $cultures = Culture::with('champ')->get();
        $result = $cultures->map(function ($culture) use ($debut, $fin) {
            $ventes = Vente::where('culture_id', $culture->id)->whereBetween('date_vente', [$debut, $fin])->sum('montant_total_fcfa');
            return [
                'culture_id' => $culture->id,
                'culture_nom' => $culture->nom,
                'champ_nom' => $culture->champ->nom ?? null,
                'total_ventes_fcfa' => $ventes,
                'solde_net_fcfa' => $ventes,
            ];
        });

        return response()->json($result);
    }

    public function exportExcel(Request $request)
    {
        ['debut' => $debut, 'fin' => $fin] = $this->getDateRange($request);
        return Excel::download(new FinanceExport($debut, $fin), "finance-{$debut}-{$fin}.xlsx");
    }
}
