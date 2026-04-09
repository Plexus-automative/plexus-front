'use client';

import { useState } from 'react';
import { OrderLine } from 'types/order';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  MenuItem,
  Button,
  Stack,
  Box,
  Typography,
  IconButton
} from '@mui/material';
import { ClipboardClose, Edit } from '@wandersonalwes/iconsax-react';

interface Props {
  lines: OrderLine[];
  onClose: () => void;
}

export default function OrderEdit_Recues({ lines, onClose }: Props) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editValues, setEditValues] = useState<Partial<OrderLine>>({});
  const [localLines, setLocalLines] = useState<OrderLine[]>(lines);

  const startEdit = (index: number) => {
    setEditingIndex(index);
    setEditValues({ ...localLines[index] });
  };

  const saveEdit = (index: number) => {
    const updated = localLines.map((line, i) => (i === index ? { ...line, ...editValues } : line));
    setLocalLines(updated);
    setEditingIndex(null);
    setEditValues({});
  };

  const cancelEdit = () => {
    setEditingIndex(null);
    setEditValues({});
  };

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="h6">Edit Order Lines</Typography>

      </Stack>
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Num Article</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Prix Unitaire</TableCell>
              <TableCell>Quantité</TableCell>
              <TableCell>Quantité Livrée</TableCell>
              <TableCell>Confirme ?</TableCell>
              <TableCell>Date livraison</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {localLines.map((line, index) => (
              <TableRow key={line.numArticle}>
                <TableCell>{line.numArticle}</TableCell>
                <TableCell>
                  {editingIndex === index ? (
                    <TextField
                      value={editValues.description ?? ''}
                      onChange={(e) => setEditValues({ ...editValues, description: e.target.value })}
                      size="small"
                      fullWidth
                    />
                  ) : (
                    line.description
                  )}
                </TableCell>
                <TableCell>
                  {editingIndex === index ? (
                    <TextField
                      type="number"
                      value={editValues.prixUnitaire ?? 0}
                      onChange={(e) => setEditValues({ ...editValues, prixUnitaire: Number(e.target.value) })}
                      size="small"
                    />
                  ) : (
                    line.prixUnitaire.toFixed(3)
                  )}
                </TableCell>
                <TableCell>
                  {editingIndex === index ? (
                    <TextField
                      type="number"
                      value={editValues.quantite ?? 0}
                      onChange={(e) => setEditValues({ ...editValues, quantite: Number(e.target.value) })}
                      size="small"
                    />
                  ) : (
                    line.quantite
                  )}
                </TableCell>
                <TableCell>
                  {editingIndex === index ? (
                    <TextField
                      type="number"
                      value={editValues.quantiteLivree ?? 0}
                      onChange={(e) => setEditValues({ ...editValues, quantiteLivree: Number(e.target.value) })}
                      size="small"
                    />
                  ) : (
                    line.quantiteLivree
                  )}
                </TableCell>
                <TableCell>
                  {editingIndex === index ? (
                    <TextField
                      select
                      size="small"
                      value={editValues.confirmation ?? line.confirmation ?? ''}
                      onChange={(e) => {
                        const val = e.target.value as string;
                        setEditValues({
                          ...editValues,
                          confirmation: val,
                          dateLivraison: val === 'Liv pevu a date' ? (editValues.dateLivraison ?? line.dateLivraison ?? '') : ''
                        });
                      }}
                    >
                      <MenuItem value="Disponible">Disponible</MenuItem>
                      <MenuItem value="Non Disponible">Non Disponible</MenuItem>
                      <MenuItem value="Liv pevu a date">Liv pevu a date</MenuItem>
                    </TextField>
                  ) : (
                    line.confirmation
                  )}
                </TableCell>
                <TableCell>
                  {editingIndex === index ? (
                    ((editValues.confirmation ?? line.confirmation) === 'Liv pevu a date') ? (
                      <TextField
                        type="date"
                        size="small"
                        value={editValues.dateLivraison ?? line.dateLivraison ?? ''}
                        onChange={(e) => setEditValues({ ...editValues, dateLivraison: e.target.value })}
                        InputLabelProps={{ shrink: true }}
                      />
                    ) : (
                      ''
                    )
                  ) : (
                    (line.confirmation === 'Liv pevu a date') ? line.dateLivraison : ''
                  )}
                </TableCell>
                <TableCell>
                  <Stack direction="row" spacing={1}>
                    {editingIndex === index ? (
                      <>
                        <Button onClick={() => saveEdit(index)} variant="contained" size="small">
                          Save
                        </Button>
                        <Button onClick={cancelEdit} variant="outlined" size="small">
                          Cancel
                        </Button>
                      </>
                    ) : (
                      <IconButton onClick={() => startEdit(index)} size="small">
                        <Edit style={{ width: 36, height: 36 }} />
                      </IconButton>)}
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}