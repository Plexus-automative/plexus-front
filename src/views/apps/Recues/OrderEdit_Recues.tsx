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
                        <Edit />
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