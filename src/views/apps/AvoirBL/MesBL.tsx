'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
    Alert,
    Box,
    Button,
    Chip,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Tooltip,
    Typography
} from '@mui/material';

import MainCard from 'components/MainCard';
import { DebouncedInput } from 'components/third-party/react-table';
import {
    AvoirBLLine,
    AvoirBLReceipt,
    applyAvoir,
    downloadAvoirDocument,
    fetchAvoirableReceipts
} from 'app/api/services/AvoirBL/AvoirBLService';

// ==============================|| MES BL — AVOIR FOURNISSEUR ||============================== //
//
// Le fournisseur corrige ici un BL (BL26/…) qu'il a livré mais que Plexus n'a pas encore
// facturé : il ramène chaque ligne à la quantité qu'il maintient. Le BL lui-même n'est pas
// touché — il a circulé, il reste tel quel — la quantité avoirée y est enregistrée et c'est
// la facture qui part du net, en affichant l'origine et l'avoir.
//
// Un BL disparaît de cette liste dès qu'il est facturé : à ce stade seul un retour
// + avoir classique est possible, et ça se traite hors portail.

const formatDate = (value: string) => {
    if (!value) return '';
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? value : parsed.toLocaleDateString('fr-FR');
};

const formatQty = (value: number) =>
    value.toLocaleString('fr-FR', { maximumFractionDigits: 3 });

/** Ce qu'il reste à avoirer sur une ligne, une fois déduits les avoirs déjà enregistrés. */
const remainingOf = (line: AvoirBLLine) => line.quantity - (line.qtyAvoir ?? 0);

/** Total déjà avoiré sur un BL, tous articles confondus. */
const totalAvoirOf = (receipt: AvoirBLReceipt) =>
    receipt.lines.reduce((sum, l) => sum + (l.qtyAvoir ?? 0), 0);

export default function MesBL() {
    const [receipts, setReceipts] = useState<AvoirBLReceipt[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);

    const [search, setSearch] = useState('');

    const [selected, setSelected] = useState<AvoirBLReceipt | null>(null);
    const [newQtyByLine, setNewQtyByLine] = useState<Record<number, string>>({});
    const [submitting, setSubmitting] = useState(false);

    const [successMsg, setSuccessMsg] = useState<string | null>(null);
    const [lastAvoirNo, setLastAvoirNo] = useState<string | null>(null);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    const loadReceipts = useCallback(async () => {
        setLoading(true);
        setLoadError(null);
        try {
            setReceipts(await fetchAvoirableReceipts());
        } catch (err: any) {
            setLoadError(readServerMessage(err));
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadReceipts();
    }, [loadReceipts]);

    // Filtrage local : la liste est déjà entièrement chargée, inutile de repasser par le
    // backend à chaque frappe. Couvre n° de BL, commande achat, commande vente et client.
    const visibleReceipts = useMemo(() => {
        const needle = search.trim().toLowerCase();
        if (!needle) return receipts;
        return receipts.filter((r) =>
            [r.documentNo, r.orderNo, r.salesOrderNo, r.customerNo, r.customerName]
                .some((field) => (field ?? '').toLowerCase().includes(needle))
        );
    }, [receipts, search]);

    // Le téléchargement doit remonter ses échecs : sans ça un refus du backend ne produisait
    // qu'une promesse rejetée dans la console, et le bouton semblait ne rien faire.
    const handleDownload = async (avoirNo: string) => {
        try {
            await downloadAvoirDocument(avoirNo);
        } catch (err: any) {
            setErrorMsg(readServerMessage(err));
        }
    };

    const openReceipt = (receipt: AvoirBLReceipt) => {
        setSelected(receipt);
        // Par défaut rien de nouveau n'est avoiré : chaque ligne repart de ce qu'il RESTE,
        // c'est-à-dire déduction faite des avoirs déjà enregistrés.
        const initial: Record<number, string> = {};
        receipt.lines.forEach((line) => {
            initial[line.lineNo] = String(remainingOf(line));
        });
        setNewQtyByLine(initial);
    };

    const closeDialog = () => {
        if (submitting) return;
        setSelected(null);
        setNewQtyByLine({});
    };

    const parsedQty = (line: AvoirBLLine): number | null => {
        const raw = newQtyByLine[line.lineNo];
        if (raw === undefined || raw.trim() === '') return null;
        const value = Number(raw.replace(',', '.'));
        if (Number.isNaN(value) || value < 0 || value > remainingOf(line)) return null;
        return value;
    };

    // Lignes réellement modifiées : ce sont les seules envoyées à BC.
    const changedLines = useMemo(() => {
        if (!selected) return [];
        return selected.lines
            .map((line) => ({ line, newQty: parsedQty(line) }))
            .filter((entry) => entry.newQty !== null && entry.newQty !== remainingOf(entry.line))
            .map((entry) => ({ lineNo: entry.line.lineNo, newQty: entry.newQty as number }));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selected, newQtyByLine]);

    const hasInvalidQty = useMemo(() => {
        if (!selected) return false;
        return selected.lines.some((line) => parsedQty(line) === null);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selected, newQtyByLine]);

    const handleSubmit = async () => {
        if (!selected || changedLines.length === 0) return;
        setSubmitting(true);
        try {
            const result = await applyAvoir(selected.documentNo, changedLines);
            setSuccessMsg(
                `Avoir ${result.avoirNo} enregistré sur le BL ${result.receiptNo}. `
                + 'La facture reprendra les quantités nettes.'
            );
            setLastAvoirNo(result.avoirNo || null);
            setSelected(null);
            setNewQtyByLine({});
            await loadReceipts();
        } catch (err: any) {
            setErrorMsg(readServerMessage(err));
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <MainCard
            title="Mes BL"
            secondary={
                <Button variant="outlined" onClick={loadReceipts} disabled={loading}>
                    Actualiser
                </Button>
            }
        >
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Les bons de livraison que vous avez livrés et que Plexus n&apos;a pas encore facturés.
                Vous pouvez y saisir un avoir : ramenez chaque ligne à la quantité que vous maintenez,
                et la facturation suivra les quantités corrigées.
            </Typography>

            {loadError && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {loadError}
                </Alert>
            )}

            {/* Alertes en flux, pas en Snackbar flottante : un parent transformé casse le
                positionnement fixed de MUI et le message venait recouvrir le tableau. */}
            {successMsg && (
                <Alert
                    severity="success"
                    sx={{ mb: 2 }}
                    onClose={() => {
                        setSuccessMsg(null);
                        setLastAvoirNo(null);
                    }}
                    action={
                        lastAvoirNo ? (
                            <Button
                                color="inherit"
                                size="small"
                                onClick={() => handleDownload(lastAvoirNo)}
                            >
                                Télécharger l&apos;avoir
                            </Button>
                        ) : undefined
                    }
                >
                    {successMsg}
                </Alert>
            )}

            {errorMsg && (
                <Alert severity="error" sx={{ mb: 2 }} onClose={() => setErrorMsg(null)}>
                    {errorMsg}
                </Alert>
            )}

            {!loading && receipts.length > 0 && (
                <Stack direction="row" sx={{ mb: 2 }}>
                    <DebouncedInput
                        value={search}
                        onFilterChange={(v) => setSearch(String(v))}
                        placeholder="Chercher par n° BL, commande ou client..."
                    />
                </Stack>
            )}

            {loading ? (
                <Stack alignItems="center" sx={{ py: 6 }}>
                    <CircularProgress />
                </Stack>
            ) : receipts.length === 0 ? (
                <Alert severity="info">Aucun BL en attente de facturation pour le moment.</Alert>
            ) : visibleReceipts.length === 0 ? (
                <Alert severity="info">Aucun BL ne correspond à « {search} ».</Alert>
            ) : (
                <TableContainer>
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell>N° BL</TableCell>
                                <TableCell>Date</TableCell>
                                <TableCell>Client</TableCell>
                                <TableCell>N° commande achat</TableCell>
                                <TableCell align="right">Lignes</TableCell>
                                <TableCell align="right">Total HT</TableCell>
                                <TableCell align="right" />
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {visibleReceipts.map((receipt) => (
                                <TableRow key={receipt.documentNo} hover>
                                    <TableCell>
                                        <Stack direction="row" spacing={1} alignItems="center">
                                            <Typography variant="subtitle2">{receipt.documentNo}</Typography>
                                            {totalAvoirOf(receipt) > 0 && (
                                                <Tooltip
                                                    title={`Vous avez déjà avoiré ${formatQty(
                                                        totalAvoirOf(receipt)
                                                    )} sur ce BL. La facturation en tiendra compte.`}
                                                >
                                                    <Chip
                                                        size="small"
                                                        color="warning"
                                                        variant="outlined"
                                                        label={`Avoir ${formatQty(totalAvoirOf(receipt))}`}
                                                    />
                                                </Tooltip>
                                            )}
                                        </Stack>
                                    </TableCell>
                                    <TableCell>{formatDate(receipt.postingDate)}</TableCell>
                                    <TableCell>
                                        <Tooltip title={receipt.customerNo}>
                                            <span>{receipt.customerName || receipt.customerNo}</span>
                                        </Tooltip>
                                    </TableCell>
                                    <TableCell>{receipt.orderNo}</TableCell>
                                    <TableCell align="right">{receipt.lines.length}</TableCell>
                                    <TableCell align="right">
                                        {receipt.lines
                                            .reduce((sum, l) => sum + l.quantity * l.unitPrice, 0)
                                            .toLocaleString('fr-FR', { maximumFractionDigits: 3 })}
                                    </TableCell>
                                    <TableCell align="right">
                                        <Stack direction="row" spacing={1} justifyContent="flex-end">
                                            {(receipt.avoirNos ?? []).map((no) => (
                                                <Tooltip key={no} title={`Télécharger le document ${no}`}>
                                                    <Button
                                                        size="small"
                                                        variant="outlined"
                                                        color="warning"
                                                        onClick={() => handleDownload(no)}
                                                    >
                                                        {no}
                                                    </Button>
                                                </Tooltip>
                                            ))}
                                            <Button
                                                size="small"
                                                variant="contained"
                                                onClick={() => openReceipt(receipt)}
                                            >
                                                {totalAvoirOf(receipt) > 0 ? 'Compléter l’avoir' : 'Saisir un avoir'}
                                            </Button>
                                        </Stack>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}

            <Dialog open={!!selected} onClose={closeDialog} maxWidth="md" fullWidth>
                <DialogTitle>
                    <Stack direction="row" spacing={1} alignItems="center">
                        <span>Avoir sur le BL {selected?.documentNo}</span>
                        {selected?.orderNo && <Chip size="small" label={selected.orderNo} />}
                        {selected?.customerName && (
                            <Chip size="small" variant="outlined" label={selected.customerName} />
                        )}
                    </Stack>
                </DialogTitle>
                <Divider />
                <DialogContent>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        Saisissez la quantité que vous <b>maintenez</b> après avoir. Mettez 0 pour annuler
                        entièrement une ligne. Les lignes non modifiées restent telles quelles.
                    </Typography>

                    {selected && totalAvoirOf(selected) > 0 && (
                        <Alert severity="warning" sx={{ mb: 2 }}>
                            Ce BL porte déjà un avoir de {formatQty(totalAvoirOf(selected))}. La colonne
                            « Reste » indique ce sur quoi vous pouvez encore revenir.
                        </Alert>
                    )}

                    <TableContainer>
                        <Table size="small">
                            <TableHead>
                                <TableRow>
                                    <TableCell>Article</TableCell>
                                    <TableCell>Désignation</TableCell>
                                    <TableCell align="right">Qté BL</TableCell>
                                    <TableCell align="right">Déjà avoirée</TableCell>
                                    <TableCell align="right">Reste</TableCell>
                                    <TableCell align="right">Qté après avoir</TableCell>
                                    <TableCell align="right">Nouvel avoir</TableCell>
                                    <TableCell align="right">PU</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {selected?.lines.map((line) => {
                                    const value = parsedQty(line);
                                    const invalid = value === null;
                                    return (
                                        <TableRow key={line.lineNo}>
                                            <TableCell>{line.itemNo}</TableCell>
                                            <TableCell>{line.description}</TableCell>
                                            <TableCell align="right">
                                                {formatQty(line.quantity)} {line.unitOfMeasureCode}
                                            </TableCell>
                                            <TableCell align="right">
                                                {line.qtyAvoir > 0 ? (
                                                    <Typography variant="body2" color="warning.main">
                                                        {formatQty(line.qtyAvoir)}
                                                    </Typography>
                                                ) : (
                                                    '—'
                                                )}
                                            </TableCell>
                                            <TableCell align="right">{formatQty(remainingOf(line))}</TableCell>
                                            <TableCell align="right" sx={{ width: 160 }}>
                                                <TextField
                                                    size="small"
                                                    value={newQtyByLine[line.lineNo] ?? ''}
                                                    error={invalid}
                                                    helperText={invalid ? `0 à ${formatQty(remainingOf(line))}` : ''}
                                                    onChange={(e) =>
                                                        setNewQtyByLine((prev) => ({
                                                            ...prev,
                                                            [line.lineNo]: e.target.value
                                                        }))
                                                    }
                                                    inputProps={{ inputMode: 'decimal', style: { textAlign: 'right' } }}
                                                />
                                            </TableCell>
                                            <TableCell align="right">
                                                {invalid ? (
                                                    '—'
                                                ) : (
                                                    <Typography
                                                        variant="body2"
                                                        color={
                                                            remainingOf(line) - value > 0
                                                                ? 'error.main'
                                                                : 'text.secondary'
                                                        }
                                                    >
                                                        {formatQty(remainingOf(line) - value)}
                                                    </Typography>
                                                )}
                                            </TableCell>
                                            <TableCell align="right">
                                                {line.unitPrice.toLocaleString('fr-FR', {
                                                    maximumFractionDigits: 3
                                                })}
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </TableContainer>

                    <Box sx={{ mt: 2 }}>
                        {hasInvalidQty ? (
                            <Alert severity="warning">
                                Certaines quantités sont invalides : chaque ligne doit être comprise entre 0 et sa
                                quantité BL.
                            </Alert>
                        ) : changedLines.length === 0 ? (
                            <Alert severity="info">
                                Aucune quantité modifiée : il n&apos;y a pas encore d&apos;avoir à envoyer.
                            </Alert>
                        ) : (
                            <Alert severity="warning">
                                {changedLines.length} ligne(s) seront avoirées. Le BL {selected?.documentNo} n&apos;est
                                pas modifié : la quantité avoirée y est enregistrée, et la facture sera établie sur
                                le net. Cette opération est immédiate.
                            </Alert>
                        )}
                    </Box>
                </DialogContent>
                <Divider />
                <DialogActions>
                    <Button onClick={closeDialog} disabled={submitting}>
                        Annuler
                    </Button>
                    <Tooltip title={changedLines.length === 0 ? 'Modifiez au moins une quantité' : ''}>
                        <span>
                            <Button
                                variant="contained"
                                color="error"
                                onClick={handleSubmit}
                                disabled={submitting || hasInvalidQty || changedLines.length === 0}
                                startIcon={submitting ? <CircularProgress size={16} color="inherit" /> : undefined}
                            >
                                Envoyer l&apos;avoir
                            </Button>
                        </span>
                    </Tooltip>
                </DialogActions>
            </Dialog>

        </MainCard>
    );
}

// L'intercepteur axios rejette avec le CORPS de la réponse, pas une Error : err.message est
// souvent vide. Les refus métier de BC (ligne déjà facturée, marchandise déjà expédiée)
// arrivent ici en texte — on les montre tels quels plutôt qu'un "Erreur inconnue".
function readServerMessage(err: any): string {
    return (
        (typeof err === 'string' ? err : null) ||
        err?.error ||
        err?.response?.data?.error ||
        (typeof err?.response?.data === 'string' ? err.response.data : null) ||
        err?.message ||
        'Erreur inconnue'
    );
}
