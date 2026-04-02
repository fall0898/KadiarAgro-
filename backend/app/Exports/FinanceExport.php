<?php

namespace App\Exports;

use App\Models\Champ;
use App\Models\Depense;
use App\Models\Vente;
use Carbon\Carbon;
use Maatwebsite\Excel\Concerns\WithMultipleSheets;
use Maatwebsite\Excel\Concerns\WithTitle;
use Maatwebsite\Excel\Concerns\WithEvents;
use Maatwebsite\Excel\Concerns\WithColumnWidths;
use Maatwebsite\Excel\Events\AfterSheet;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Border;

// ============================================================
// Entrée principale
// ============================================================
class FinanceExport implements WithMultipleSheets
{
    public function __construct(private string $debut, private string $fin) {}

    public function sheets(): array
    {
        return [
            new TableauBordSheet($this->debut, $this->fin),
            new DepensesParExploitationSheet($this->debut, $this->fin),
            new VentesSheet($this->debut, $this->fin),
        ];
    }
}

// ============================================================
// Helpers partagés
// ============================================================
trait SheetHelpers
{
    private function periodeFr(string $debut, string $fin): string
    {
        $d = Carbon::parse($debut)->locale('fr')->isoFormat('D MMMM YYYY');
        $f = Carbon::parse($fin)->locale('fr')->isoFormat('D MMMM YYYY');
        return "Période : du {$d} au {$f}";
    }

    private function catLabel(string $cat): string
    {
        return [
            'intrant'                   => 'Intrant',
            'salaire'                   => 'Salaire',
            'materiel'                  => 'Matériel',
            'carburant'                 => 'Carburant',
            'main_oeuvre'               => "Main-d'œuvre",
            'traitement_phytosanitaire' => 'Traitement phytosanitaire',
            'transport'                 => 'Transport',
            'irrigation'                => 'Irrigation',
            'entretien_materiel'        => 'Entretien matériel',
            'alimentation_betail'       => 'Alimentation bétail',
            'frais_recolte'             => 'Frais récolte',
            'autre'                     => 'Autre',
        ][$cat] ?? $cat;
    }

    private function applyBlocTitre($sheet, string $cell, string $merge, string $text, int $height = 42): void
    {
        $sheet->mergeCells($merge);
        $sheet->setCellValue($cell, $text);
        $sheet->getStyle($cell)->applyFromArray([
            'font'      => ['name' => 'Calibri', 'bold' => true, 'size' => 20, 'color' => ['argb' => 'FFFFFFFF']],
            'fill'      => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['argb' => 'FF15803D']],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER],
        ]);
        $sheet->getRowDimension(intval(substr($cell, 1)))->setRowHeight($height);
    }

    private function applySousTitre($sheet, string $cell, string $merge, string $text): void
    {
        $sheet->mergeCells($merge);
        $sheet->setCellValue($cell, $text);
        $sheet->getStyle($cell)->applyFromArray([
            'font'      => ['name' => 'Calibri', 'bold' => true, 'size' => 12, 'color' => ['argb' => 'FFFFFFFF']],
            'fill'      => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['argb' => 'FF166534']],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER],
        ]);
        $sheet->getRowDimension(intval(substr($cell, 1)))->setRowHeight(26);
    }

    private function applyPeriode($sheet, string $cell, string $merge, string $text): void
    {
        $sheet->mergeCells($merge);
        $sheet->setCellValue($cell, $text);
        $sheet->getStyle($cell)->applyFromArray([
            'font'      => ['name' => 'Calibri', 'italic' => true, 'size' => 10, 'color' => ['argb' => 'FF374151']],
            'fill'      => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['argb' => 'FFDCFCE7']],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER],
        ]);
        $sheet->getRowDimension(intval(substr($cell, 1)))->setRowHeight(20);
    }

    private function applySectionHeader($sheet, string $cell, string $merge, string $text, string $bgArgb = 'FFD97706'): void
    {
        $sheet->mergeCells($merge);
        $sheet->setCellValue($cell, $text);
        $sheet->getStyle($cell)->applyFromArray([
            'font'      => ['name' => 'Calibri', 'bold' => true, 'size' => 11, 'color' => ['argb' => 'FFFFFFFF']],
            'fill'      => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['argb' => $bgArgb]],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_LEFT, 'indent' => 1, 'vertical' => Alignment::VERTICAL_CENTER],
        ]);
        $sheet->getRowDimension(intval(substr($cell, 1)))->setRowHeight(22);
    }

    private function applyTableHeader($sheet, int $row, array $cols, string $bgArgb = 'FF166534'): void
    {
        foreach ($cols as $col => $cfg) {
            $cell = "{$col}{$row}";
            $sheet->setCellValue($cell, $cfg['label']);
            $sheet->getStyle($cell)->applyFromArray([
                'font'      => ['name' => 'Calibri', 'bold' => true, 'size' => 10, 'color' => ['argb' => 'FFFFFFFF']],
                'fill'      => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['argb' => $bgArgb]],
                'alignment' => [
                    'horizontal' => $cfg['align'] ?? Alignment::HORIZONTAL_CENTER,
                    'vertical'   => Alignment::VERTICAL_CENTER,
                    'wrapText'   => true,
                ],
                'borders'   => ['allBorders' => ['borderStyle' => Border::BORDER_THIN, 'color' => ['argb' => 'FF15803D']]],
            ]);
        }
        $sheet->getRowDimension($row)->setRowHeight(24);
    }

    private function applyTotalRow($sheet, int $row, string $rangeLabel, string $mergeCols, string $montantCol, float $montant, string $bgArgb = 'FF15803D'): void
    {
        $sheet->mergeCells("{$mergeCols}{$row}");
        $sheet->setCellValue("{$mergeCols[0]}{$row}", $rangeLabel);
        $sheet->setCellValue("{$montantCol}{$row}", $montant);
        $sheet->getStyle("{$mergeCols[0]}{$row}:{$montantCol}{$row}")->applyFromArray([
            'font'    => ['name' => 'Calibri', 'bold' => true, 'size' => 11, 'color' => ['argb' => 'FFFFFFFF']],
            'fill'    => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['argb' => $bgArgb]],
            'borders' => ['outline' => ['borderStyle' => Border::BORDER_MEDIUM, 'color' => ['argb' => $bgArgb]]],
        ]);
        $sheet->getStyle("{$montantCol}{$row}")->getNumberFormat()->setFormatCode('#,##0');
        $sheet->getStyle("{$montantCol}{$row}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_RIGHT);
        $sheet->getRowDimension($row)->setRowHeight(24);
    }
}

// ============================================================
// FEUILLE 1 : Tableau de Bord
// ============================================================
class TableauBordSheet implements WithTitle, WithEvents, WithColumnWidths
{
    use SheetHelpers;

    public function __construct(private string $debut, private string $fin) {}

    public function title(): string { return '📊 Tableau de Bord'; }

    public function columnWidths(): array
    {
        return ['A' => 32, 'B' => 22, 'C' => 22, 'D' => 22, 'E' => 14, 'F' => 14];
    }

    public function registerEvents(): array
    {
        return [
            AfterSheet::class => function (AfterSheet $event) {
                $sheet = $event->sheet->getDelegate();

                $totalVentes   = Vente::whereBetween('date_vente', [$this->debut, $this->fin])->sum('montant_total_fcfa');
                $totalDepenses = Depense::whereBetween('date_depense', [$this->debut, $this->fin])->sum('montant_fcfa');
                $soldeNet      = $totalVentes - $totalDepenses;
                $champs        = Champ::all();
                $nbVentes      = Vente::whereBetween('date_vente', [$this->debut, $this->fin])->count();
                $nbDepenses    = Depense::whereBetween('date_depense', [$this->debut, $this->fin])->count();

                // ---- ENTÊTE ----
                $this->applyBlocTitre($sheet, 'A1', 'A1:F1', 'KADIAR AGRO', 44);
                $this->applySousTitre($sheet, 'A2', 'A2:F2', 'RAPPORT FINANCIER DE CAMPAGNE AGRICOLE');
                $this->applyPeriode($sheet, 'A3', 'A3:F3', $this->periodeFr($this->debut, $this->fin));

                $sheet->mergeCells('A4:F4');
                $sheet->setCellValue('A4', 'Généré le ' . now()->locale('fr')->isoFormat('D MMMM YYYY [à] HH:mm'));
                $sheet->getStyle('A4')->applyFromArray([
                    'font'      => ['name' => 'Calibri', 'size' => 9, 'color' => ['argb' => 'FF9CA3AF'], 'italic' => true],
                    'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER],
                ]);
                $sheet->getRowDimension(4)->setRowHeight(16);
                $sheet->getRowDimension(5)->setRowHeight(14); // spacer

                // ---- KPI ----
                $this->applySectionHeader($sheet, 'A6', 'A6:F6', '  INDICATEURS CLÉS DE LA CAMPAGNE', 'FFD97706');

                $sheet->setCellValue('B7', 'TOTAL VENTES');
                $sheet->setCellValue('C7', 'TOTAL DÉPENSES');
                $sheet->setCellValue('D7', 'SOLDE NET');
                $sheet->getStyle('B7:D7')->applyFromArray([
                    'font'      => ['name' => 'Calibri', 'bold' => true, 'size' => 10, 'color' => ['argb' => 'FF374151']],
                    'fill'      => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['argb' => 'FFF9FAFB']],
                    'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER],
                    'borders'   => ['top' => ['borderStyle' => Border::BORDER_MEDIUM, 'color' => ['argb' => 'FFD1D5DB']]],
                ]);
                $sheet->getRowDimension(7)->setRowHeight(22);

                // Valeurs KPI
                $sheet->setCellValue('B8', $totalVentes);
                $sheet->getStyle('B8')->applyFromArray([
                    'font'    => ['name' => 'Calibri', 'bold' => true, 'size' => 16, 'color' => ['argb' => 'FF15803D']],
                    'fill'    => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['argb' => 'FFDCFCE7']],
                    'borders' => ['outline' => ['borderStyle' => Border::BORDER_MEDIUM, 'color' => ['argb' => 'FF86EFAC']]],
                    'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER],
                ]);
                $sheet->getStyle('B8')->getNumberFormat()->setFormatCode('#,##0 "FCFA"');

                $sheet->setCellValue('C8', $totalDepenses);
                $sheet->getStyle('C8')->applyFromArray([
                    'font'    => ['name' => 'Calibri', 'bold' => true, 'size' => 16, 'color' => ['argb' => 'FFDC2626']],
                    'fill'    => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['argb' => 'FFFEE2E2']],
                    'borders' => ['outline' => ['borderStyle' => Border::BORDER_MEDIUM, 'color' => ['argb' => 'FFFCA5A5']]],
                    'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER],
                ]);
                $sheet->getStyle('C8')->getNumberFormat()->setFormatCode('#,##0 "FCFA"');

                $soldeArgb  = $soldeNet >= 0 ? 'FF15803D' : 'FFDC2626';
                $soldeBg    = $soldeNet >= 0 ? 'FFDCFCE7' : 'FFFEE2E2';
                $soldeBord  = $soldeNet >= 0 ? 'FF86EFAC' : 'FFFCA5A5';
                $sheet->setCellValue('D8', $soldeNet);
                $sheet->getStyle('D8')->applyFromArray([
                    'font'    => ['name' => 'Calibri', 'bold' => true, 'size' => 16, 'color' => ['argb' => $soldeArgb]],
                    'fill'    => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['argb' => $soldeBg]],
                    'borders' => ['outline' => ['borderStyle' => Border::BORDER_MEDIUM, 'color' => ['argb' => $soldeBord]]],
                    'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER],
                ]);
                $sheet->getStyle('D8')->getNumberFormat()->setFormatCode('#,##0 "FCFA"');
                $sheet->getRowDimension(8)->setRowHeight(38);

                // Sous-infos KPI
                $sheet->setCellValue('B9', "{$nbVentes} vente(s)");
                $sheet->setCellValue('C9', "{$nbDepenses} dépense(s)");
                $sheet->getStyle('B9:D9')->applyFromArray([
                    'font'      => ['name' => 'Calibri', 'size' => 9, 'color' => ['argb' => 'FF6B7280'], 'italic' => true],
                    'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER],
                    'borders'   => ['bottom' => ['borderStyle' => Border::BORDER_MEDIUM, 'color' => ['argb' => 'FFD1D5DB']]],
                ]);
                $sheet->getRowDimension(9)->setRowHeight(16);
                $sheet->getRowDimension(10)->setRowHeight(14); // spacer

                // ---- SYNTHÈSE PAR EXPLOITATION ----
                $this->applySectionHeader($sheet, 'A11', 'A11:F11', '  SYNTHÈSE PAR EXPLOITATION', 'FF15803D');

                $this->applyTableHeader($sheet, 12, [
                    'A' => ['label' => 'Exploitation'],
                    'B' => ['label' => 'Ventes (FCFA)', 'align' => Alignment::HORIZONTAL_RIGHT],
                    'C' => ['label' => 'Dépenses (FCFA)', 'align' => Alignment::HORIZONTAL_RIGHT],
                    'D' => ['label' => 'Solde Net (FCFA)', 'align' => Alignment::HORIZONTAL_RIGHT],
                    'E' => ['label' => 'Nb Dép.'],
                    'F' => ['label' => 'Nb Ventes'],
                ]);

                $row = 13;
                $isEven = false;
                foreach ($champs as $champ) {
                    $v    = Vente::where('champ_id', $champ->id)->whereBetween('date_vente', [$this->debut, $this->fin])->sum('montant_total_fcfa');
                    $d    = Depense::where('champ_id', $champ->id)->whereBetween('date_depense', [$this->debut, $this->fin])->sum('montant_fcfa');
                    $s    = $v - $d;
                    $nbD  = Depense::where('champ_id', $champ->id)->whereBetween('date_depense', [$this->debut, $this->fin])->count();
                    $nbV  = Vente::where('champ_id', $champ->id)->whereBetween('date_vente', [$this->debut, $this->fin])->count();
                    $bg   = $isEven ? 'FFF0FDF4' : 'FFFFFFFF';

                    $sheet->setCellValue("A{$row}", $champ->nom);
                    $sheet->setCellValue("B{$row}", $v);
                    $sheet->setCellValue("C{$row}", $d);
                    $sheet->setCellValue("D{$row}", $s);
                    $sheet->setCellValue("E{$row}", $nbD);
                    $sheet->setCellValue("F{$row}", $nbV);

                    $sheet->getStyle("A{$row}:F{$row}")->applyFromArray([
                        'font'    => ['name' => 'Calibri', 'size' => 10],
                        'fill'    => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['argb' => $bg]],
                        'borders' => ['bottom' => ['borderStyle' => Border::BORDER_HAIR, 'color' => ['argb' => 'FFD1FAE5']]],
                    ]);
                    $sheet->getStyle("A{$row}")->getFont()->setBold(true);
                    foreach (['B', 'C', 'D'] as $col) {
                        $sheet->getStyle("{$col}{$row}")->getNumberFormat()->setFormatCode('#,##0');
                        $sheet->getStyle("{$col}{$row}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_RIGHT);
                    }
                    foreach (['E', 'F'] as $col) {
                        $sheet->getStyle("{$col}{$row}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
                    }
                    $sArgb = $s >= 0 ? 'FF15803D' : 'FFDC2626';
                    $sheet->getStyle("D{$row}")->applyFromArray(['font' => ['bold' => true, 'color' => ['argb' => $sArgb]]]);
                    $sheet->getStyle("C{$row}")->applyFromArray(['font' => ['color' => ['argb' => 'FFDC2626']]]);
                    $sheet->getStyle("B{$row}")->applyFromArray(['font' => ['color' => ['argb' => 'FF15803D']]]);
                    $sheet->getRowDimension($row)->setRowHeight(20);

                    $row++;
                    $isEven = !$isEven;
                }

                // Ligne dépenses sans champ
                $dSans  = Depense::whereNull('champ_id')->whereBetween('date_depense', [$this->debut, $this->fin])->sum('montant_fcfa');
                $vSans  = Vente::whereNull('champ_id')->whereBetween('date_vente', [$this->debut, $this->fin])->sum('montant_total_fcfa');
                $nbDSans = Depense::whereNull('champ_id')->whereBetween('date_depense', [$this->debut, $this->fin])->count();
                if ($dSans > 0 || $vSans > 0) {
                    $sSans = $vSans - $dSans;
                    $sheet->setCellValue("A{$row}", 'Dépenses générales');
                    $sheet->setCellValue("B{$row}", $vSans);
                    $sheet->setCellValue("C{$row}", $dSans);
                    $sheet->setCellValue("D{$row}", $sSans);
                    $sheet->setCellValue("E{$row}", $nbDSans);
                    $sheet->setCellValue("F{$row}", 0);
                    $sheet->getStyle("A{$row}:F{$row}")->applyFromArray([
                        'font'    => ['name' => 'Calibri', 'size' => 10, 'italic' => true],
                        'fill'    => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['argb' => 'FFFEF3C7']],
                        'borders' => ['bottom' => ['borderStyle' => Border::BORDER_THIN, 'color' => ['argb' => 'FFFCD34D']]],
                    ]);
                    foreach (['B', 'C', 'D'] as $col) {
                        $sheet->getStyle("{$col}{$row}")->getNumberFormat()->setFormatCode('#,##0');
                        $sheet->getStyle("{$col}{$row}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_RIGHT);
                    }
                    $sArgb = $sSans >= 0 ? 'FF15803D' : 'FFDC2626';
                    $sheet->getStyle("D{$row}")->applyFromArray(['font' => ['bold' => true, 'color' => ['argb' => $sArgb]]]);
                    $sheet->getStyle("C{$row}")->applyFromArray(['font' => ['color' => ['argb' => 'FFDC2626']]]);
                    $sheet->getRowDimension($row)->setRowHeight(20);
                    $row++;
                }

                // Ligne Total Général
                $this->applyTotalRow($sheet, $row, 'TOTAL GÉNÉRAL', "A{$row}:E{$row}", 'F', 0);
                $sheet->setCellValue("B{$row}", $totalVentes);
                $sheet->getStyle("B{$row}")->getNumberFormat()->setFormatCode('#,##0');
                $sheet->getStyle("B{$row}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_RIGHT);
                $sheet->setCellValue("C{$row}", $totalDepenses);
                $sheet->getStyle("C{$row}")->getNumberFormat()->setFormatCode('#,##0');
                $sheet->getStyle("C{$row}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_RIGHT);
                $sheet->setCellValue("D{$row}", $soldeNet);
                $sheet->getStyle("D{$row}")->getNumberFormat()->setFormatCode('#,##0');
                $sheet->getStyle("D{$row}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_RIGHT);
                $sheet->getStyle("A{$row}:F{$row}")->applyFromArray([
                    'font' => ['name' => 'Calibri', 'bold' => true, 'size' => 11, 'color' => ['argb' => 'FFFFFFFF']],
                    'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['argb' => 'FF15803D']],
                    'borders' => ['outline' => ['borderStyle' => Border::BORDER_MEDIUM, 'color' => ['argb' => 'FF166534']]],
                ]);

                $sheet->freezePane('A13');
            },
        ];
    }
}

// ============================================================
// FEUILLE 2 : Dépenses par Exploitation
// ============================================================
class DepensesParExploitationSheet implements WithTitle, WithEvents, WithColumnWidths
{
    use SheetHelpers;

    // Palette couleurs par champ (dark, light)
    private array $palette = [
        ['FF15803D', 'FFF0FDF4'],  // vert
        ['FF1D4ED8', 'FFEFF6FF'],  // bleu
        ['FFD97706', 'FFFEFCE8'],  // ambre
        ['FF9333EA', 'FFFAF5FF'],  // violet
        ['FF0F766E', 'FFF0FDFA'],  // teal
    ];

    public function __construct(private string $debut, private string $fin) {}

    public function title(): string { return '📋 Dépenses par Exploitation'; }

    public function columnWidths(): array
    {
        return ['A' => 14, 'B' => 44, 'C' => 26, 'D' => 20];
    }

    public function registerEvents(): array
    {
        return [
            AfterSheet::class => function (AfterSheet $event) {
                $sheet = $event->sheet->getDelegate();

                // Entête
                $this->applyBlocTitre($sheet, 'A1', 'A1:D1', 'DÉTAIL DES DÉPENSES PAR EXPLOITATION', 36);
                $this->applyPeriode($sheet, 'A2', 'A2:D2', $this->periodeFr($this->debut, $this->fin));
                $sheet->getRowDimension(3)->setRowHeight(12); // spacer

                $currentRow = 4;
                $grandTotal = 0;
                $colorIdx   = 0;
                $champs     = Champ::all();

                $writeBloc = function (string $nom, $depenses, string $darkColor, string $lightColor) use (&$currentRow, &$grandTotal, $sheet) {
                    // En-tête du champ
                    $sheet->mergeCells("A{$currentRow}:D{$currentRow}");
                    $sheet->setCellValue("A{$currentRow}", '  ' . mb_strtoupper($nom));
                    $sheet->getStyle("A{$currentRow}")->applyFromArray([
                        'font'      => ['name' => 'Calibri', 'bold' => true, 'size' => 12, 'color' => ['argb' => 'FFFFFFFF']],
                        'fill'      => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['argb' => $darkColor]],
                        'alignment' => ['horizontal' => Alignment::HORIZONTAL_LEFT, 'vertical' => Alignment::VERTICAL_CENTER],
                        'borders'   => ['outline' => ['borderStyle' => Border::BORDER_MEDIUM, 'color' => ['argb' => $darkColor]]],
                    ]);
                    $sheet->getRowDimension($currentRow)->setRowHeight(26);
                    $currentRow++;

                    // Colonnes
                    foreach (['A' => 'Date', 'B' => 'Description', 'C' => 'Catégorie', 'D' => 'Montant (FCFA)'] as $col => $label) {
                        $sheet->setCellValue("{$col}{$currentRow}", $label);
                        $isRight = $col === 'D';
                        $sheet->getStyle("{$col}{$currentRow}")->applyFromArray([
                            'font'      => ['name' => 'Calibri', 'bold' => true, 'size' => 9, 'color' => ['argb' => 'FFFFFFFF']],
                            'fill'      => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['argb' => $darkColor]],
                            'alignment' => ['horizontal' => $isRight ? Alignment::HORIZONTAL_RIGHT : Alignment::HORIZONTAL_LEFT],
                            'borders'   => ['bottom' => ['borderStyle' => Border::BORDER_MEDIUM, 'color' => ['argb' => 'FFFFFFFF']]],
                        ]);
                    }
                    $sheet->getRowDimension($currentRow)->setRowHeight(18);
                    $currentRow++;

                    $champTotal = 0;
                    $isEven     = false;
                    foreach ($depenses as $dep) {
                        $bg = $isEven ? $lightColor : 'FFFFFFFF';
                        $sheet->setCellValue("A{$currentRow}", $dep->date_depense->format('d/m/Y'));
                        $sheet->setCellValue("B{$currentRow}", $dep->description);
                        $sheet->setCellValue("C{$currentRow}", $this->catLabel($dep->categorie));
                        $sheet->setCellValue("D{$currentRow}", $dep->montant_fcfa);
                        $sheet->getStyle("A{$currentRow}:D{$currentRow}")->applyFromArray([
                            'font'    => ['name' => 'Calibri', 'size' => 9],
                            'fill'    => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['argb' => $bg]],
                            'borders' => ['bottom' => ['borderStyle' => Border::BORDER_HAIR, 'color' => ['argb' => 'FFE5E7EB']]],
                        ]);
                        $sheet->getStyle("D{$currentRow}")->getNumberFormat()->setFormatCode('#,##0');
                        $sheet->getStyle("D{$currentRow}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_RIGHT);
                        $champTotal += $dep->montant_fcfa;
                        $grandTotal += $dep->montant_fcfa;
                        $isEven = !$isEven;
                        $currentRow++;
                    }

                    // Sous-total champ
                    $sheet->mergeCells("A{$currentRow}:C{$currentRow}");
                    $sheet->setCellValue("A{$currentRow}", "  Total {$nom}");
                    $sheet->setCellValue("D{$currentRow}", $champTotal);
                    $sheet->getStyle("A{$currentRow}:D{$currentRow}")->applyFromArray([
                        'font'    => ['name' => 'Calibri', 'bold' => true, 'size' => 10, 'color' => ['argb' => 'FFFFFFFF']],
                        'fill'    => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['argb' => $darkColor]],
                        'borders' => ['outline' => ['borderStyle' => Border::BORDER_MEDIUM, 'color' => ['argb' => $darkColor]]],
                        'alignment' => ['vertical' => Alignment::VERTICAL_CENTER],
                    ]);
                    $sheet->getStyle("D{$currentRow}")->getNumberFormat()->setFormatCode('#,##0');
                    $sheet->getStyle("D{$currentRow}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_RIGHT);
                    $sheet->getRowDimension($currentRow)->setRowHeight(22);
                    $currentRow += 2; // espaceur
                };

                foreach ($champs as $champ) {
                    $depenses = Depense::where('champ_id', $champ->id)
                        ->whereBetween('date_depense', [$this->debut, $this->fin])
                        ->orderBy('date_depense')
                        ->get();
                    if ($depenses->isEmpty()) continue;

                    [$dark, $light] = $this->palette[$colorIdx % count($this->palette)];
                    $writeBloc($champ->nom, $depenses, $dark, $light);
                    $colorIdx++;
                }

                // Dépenses sans champ
                $depensesSans = Depense::whereNull('champ_id')
                    ->whereBetween('date_depense', [$this->debut, $this->fin])
                    ->orderBy('date_depense')
                    ->get();
                if ($depensesSans->isNotEmpty()) {
                    $writeBloc('Dépenses générales (multi-champs)', $depensesSans, 'FF78716C', 'FFFAFAF9');
                }

                // Grand total
                $sheet->mergeCells("A{$currentRow}:C{$currentRow}");
                $sheet->setCellValue("A{$currentRow}", '  TOTAL GÉNÉRAL DES DÉPENSES');
                $sheet->setCellValue("D{$currentRow}", $grandTotal);
                $sheet->getStyle("A{$currentRow}:D{$currentRow}")->applyFromArray([
                    'font'    => ['name' => 'Calibri', 'bold' => true, 'size' => 13, 'color' => ['argb' => 'FFFFFFFF']],
                    'fill'    => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['argb' => 'FFDC2626']],
                    'borders' => ['outline' => ['borderStyle' => Border::BORDER_MEDIUM, 'color' => ['argb' => 'FFB91C1C']]],
                    'alignment' => ['vertical' => Alignment::VERTICAL_CENTER],
                ]);
                $sheet->getStyle("D{$currentRow}")->getNumberFormat()->setFormatCode('#,##0 "FCFA"');
                $sheet->getStyle("D{$currentRow}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_RIGHT);
                $sheet->getRowDimension($currentRow)->setRowHeight(28);
            },
        ];
    }
}

// ============================================================
// FEUILLE 3 : Ventes Détaillées
// ============================================================
class VentesSheet implements WithTitle, WithEvents, WithColumnWidths
{
    use SheetHelpers;

    public function __construct(private string $debut, private string $fin) {}

    public function title(): string { return '💰 Ventes'; }

    public function columnWidths(): array
    {
        return ['A' => 14, 'B' => 20, 'C' => 20, 'D' => 18, 'E' => 22, 'F' => 14, 'G' => 18, 'H' => 20];
    }

    public function registerEvents(): array
    {
        return [
            AfterSheet::class => function (AfterSheet $event) {
                $sheet  = $event->sheet->getDelegate();
                $ventes = Vente::with('champ', 'culture')
                    ->whereBetween('date_vente', [$this->debut, $this->fin])
                    ->orderBy('date_vente')
                    ->get();

                $this->applyBlocTitre($sheet, 'A1', 'A1:H1', 'DÉTAIL DES VENTES', 36);
                $this->applyPeriode($sheet, 'A2', 'A2:H2', $this->periodeFr($this->debut, $this->fin));
                $sheet->getRowDimension(3)->setRowHeight(12);

                $this->applyTableHeader($sheet, 4, [
                    'A' => ['label' => 'Date'],
                    'B' => ['label' => 'Champ'],
                    'C' => ['label' => 'Culture'],
                    'D' => ['label' => 'Produit'],
                    'E' => ['label' => 'Acheteur'],
                    'F' => ['label' => 'Quantité (kg)', 'align' => Alignment::HORIZONTAL_RIGHT],
                    'G' => ['label' => 'Prix unit. (FCFA)', 'align' => Alignment::HORIZONTAL_RIGHT],
                    'H' => ['label' => 'Montant total (FCFA)', 'align' => Alignment::HORIZONTAL_RIGHT],
                ]);

                $row        = 5;
                $totalVentes = 0;
                $isEven     = false;

                if ($ventes->isEmpty()) {
                    $sheet->mergeCells("A5:H5");
                    $sheet->setCellValue('A5', 'Aucune vente enregistrée pour cette période.');
                    $sheet->getStyle('A5')->applyFromArray([
                        'font'      => ['name' => 'Calibri', 'italic' => true, 'color' => ['argb' => 'FF9CA3AF']],
                        'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER],
                    ]);
                    $row = 6;
                } else {
                    foreach ($ventes as $v) {
                        $bg = $isEven ? 'FFF0FDF4' : 'FFFFFFFF';
                        $sheet->setCellValue("A{$row}", $v->date_vente->format('d/m/Y'));
                        $sheet->setCellValue("B{$row}", $v->champ->nom ?? '-');
                        $sheet->setCellValue("C{$row}", $v->culture->nom ?? '-');
                        $sheet->setCellValue("D{$row}", $v->produit);
                        $sheet->setCellValue("E{$row}", $v->acheteur ?? '-');
                        $sheet->setCellValue("F{$row}", $v->quantite_kg);
                        $sheet->setCellValue("G{$row}", $v->prix_unitaire_fcfa);
                        $sheet->setCellValue("H{$row}", $v->montant_total_fcfa);
                        $sheet->getStyle("A{$row}:H{$row}")->applyFromArray([
                            'font'    => ['name' => 'Calibri', 'size' => 9],
                            'fill'    => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['argb' => $bg]],
                            'borders' => ['bottom' => ['borderStyle' => Border::BORDER_HAIR, 'color' => ['argb' => 'FFD1D5DB']]],
                        ]);
                        foreach (['F', 'G', 'H'] as $col) {
                            $sheet->getStyle("{$col}{$row}")->getNumberFormat()->setFormatCode('#,##0');
                            $sheet->getStyle("{$col}{$row}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_RIGHT);
                        }
                        $sheet->getStyle("H{$row}")->applyFromArray(['font' => ['bold' => true, 'color' => ['argb' => 'FF15803D']]]);
                        $totalVentes += $v->montant_total_fcfa;
                        $isEven = !$isEven;
                        $row++;
                    }
                }

                // Total ventes
                $sheet->mergeCells("A{$row}:G{$row}");
                $sheet->setCellValue("A{$row}", '  TOTAL VENTES');
                $sheet->setCellValue("H{$row}", $totalVentes);
                $sheet->getStyle("A{$row}:H{$row}")->applyFromArray([
                    'font'    => ['name' => 'Calibri', 'bold' => true, 'size' => 12, 'color' => ['argb' => 'FFFFFFFF']],
                    'fill'    => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['argb' => 'FF15803D']],
                    'borders' => ['outline' => ['borderStyle' => Border::BORDER_MEDIUM, 'color' => ['argb' => 'FF166534']]],
                    'alignment' => ['vertical' => Alignment::VERTICAL_CENTER],
                ]);
                $sheet->getStyle("H{$row}")->getNumberFormat()->setFormatCode('#,##0 "FCFA"');
                $sheet->getStyle("H{$row}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_RIGHT);
                $sheet->getRowDimension($row)->setRowHeight(26);

                $sheet->freezePane('A5');
            },
        ];
    }
}
