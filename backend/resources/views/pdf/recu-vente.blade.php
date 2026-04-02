<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: DejaVu Sans, sans-serif; color: #1C1917; font-size: 13px; margin: 0; padding: 0; }
        .header { background-color: #16A34A; color: white; padding: 24px 32px; text-align: center; }
        .header h1 { margin: 0; font-size: 24px; font-weight: 700; letter-spacing: 1px; }
        .header p { margin: 4px 0 0; font-size: 13px; opacity: 0.85; }
        .container { padding: 32px; }
        .badge { display: inline-block; background: #F0FDF4; color: #15803D; border: 1px solid #BBF7D0; padding: 6px 16px; border-radius: 20px; font-size: 14px; font-weight: 600; margin-bottom: 24px; }
        .info-grid { display: table; width: 100%; margin-bottom: 28px; }
        .info-row { display: table-row; }
        .info-label { display: table-cell; color: #78716C; font-size: 12px; padding: 4px 0; width: 140px; }
        .info-value { display: table-cell; font-weight: 500; padding: 4px 0; }
        table.details { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
        table.details thead tr { background: #F5F5F4; }
        table.details th { padding: 10px 12px; text-align: left; font-size: 11px; text-transform: uppercase; color: #78716C; letter-spacing: 0.5px; }
        table.details td { padding: 12px; border-bottom: 1px solid #E7E5E4; }
        .total-row { background: #F0FDF4; }
        .total-row td { font-weight: 700; font-size: 15px; color: #15803D; }
        .footer { margin-top: 40px; padding-top: 16px; border-top: 1px solid #E7E5E4; text-align: center; color: #A8A29E; font-size: 11px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>🌿 KadiarAgro</h1>
        <p>Reçu de Vente</p>
    </div>

    <div class="container">
        <div class="badge">N° VNT-{{ str_pad($vente->id, 5, '0', STR_PAD_LEFT) }}</div>

        <div class="info-grid">
            <div class="info-row">
                <span class="info-label">Date de vente</span>
                <span class="info-value">{{ $vente->date_vente->format('d/m/Y') }}</span>
            </div>
            @if($vente->acheteur)
            <div class="info-row">
                <span class="info-label">Acheteur</span>
                <span class="info-value">{{ $vente->acheteur }}</span>
            </div>
            @endif
            @if($vente->champ)
            <div class="info-row">
                <span class="info-label">Exploitation</span>
                <span class="info-value">{{ $vente->champ->nom }}</span>
            </div>
            @endif
            @if($vente->culture)
            <div class="info-row">
                <span class="info-label">Culture</span>
                <span class="info-value">{{ $vente->culture->nom }}</span>
            </div>
            @endif
        </div>

        <table class="details">
            <thead>
                <tr>
                    <th>Produit</th>
                    <th>Quantité (kg)</th>
                    <th>Prix unitaire (FCFA/kg)</th>
                    <th>Montant total (FCFA)</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>{{ $vente->produit }}</td>
                    <td>{{ number_format($vente->quantite_kg, 2, ',', ' ') }}</td>
                    <td>{{ number_format($vente->prix_unitaire_fcfa, 0, ',', ' ') }}</td>
                    <td>{{ number_format($vente->montant_total_fcfa, 0, ',', ' ') }}</td>
                </tr>
                <tr class="total-row">
                    <td colspan="3" style="text-align:right;">TOTAL</td>
                    <td>{{ number_format($vente->montant_total_fcfa, 0, ',', ' ') }} FCFA</td>
                </tr>
            </tbody>
        </table>

        @if($vente->notes)
        <p style="color:#78716C; font-size:12px;"><strong>Notes :</strong> {{ $vente->notes }}</p>
        @endif

        <div class="footer">
            <p>KadiarAgro — Document généré automatiquement le {{ now()->format('d/m/Y à H:i') }}</p>
            <p>Ce reçu fait foi de la transaction enregistrée dans le système KadiarAgro.</p>
        </div>
    </div>
</body>
</html>
