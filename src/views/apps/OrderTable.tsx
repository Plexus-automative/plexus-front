'use client';

import { OrderLine } from 'types/order';
import { 
    Table, 
    TableBody, 
    TableCell, 
    TableContainer, 
    TableHead, 
    TableRow, 
    Button, 
    Stack,
    Box,
    Typography
} from '@mui/material';
import { ClipboardClose } from '@wandersonalwes/iconsax-react';

interface Props {
  lines: OrderLine[];
  onClose: () => void;
}

export default function OrderTable({ lines, onClose }: Props) {
  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="h6">Order Details</Typography>

      </Stack>
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Num Article</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Prix Unitaire</TableCell>
              <TableCell>Quantité</TableCell>
              <TableCell>Quantité Disponible</TableCell>
              <TableCell>Quantité Validée</TableCell>
              <TableCell>Quantité Livrée</TableCell>
              <TableCell>Confirmation</TableCell>
              <TableCell>Date Livraison</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {lines.map((line) => (
              <TableRow key={line.numArticle}>
                <TableCell>{line.numArticle}</TableCell>
                <TableCell>{line.description}</TableCell>
                <TableCell>{line.prixUnitaire.toFixed(3)}</TableCell>
                <TableCell>{line.quantite}</TableCell>
                <TableCell>{line.quantiteDisponible}</TableCell>
                <TableCell>{line.quantiteValidee}</TableCell>
                <TableCell>{line.quantiteLivree}</TableCell>
                <TableCell>{line.confirmation}</TableCell>
                <TableCell>{line.dateLivraison}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}