// material-ui
import TableCell from '@mui/material/TableCell';
import TextField from '@mui/material/TextField';

// ==============================|| INVOICE - TEXT FIELD ||============================== //

export default function InvoiceField({ onEditItem, cellData }: any) {
  return (
    <TableCell sx={{ '& .MuiFormHelperText-root': { position: 'absolute', bottom: -24, ml: 0 } }}>
      <TextField
        type={cellData.type}
        fullWidth
        placeholder={cellData.placeholder}
        name={cellData.name}
        id={cellData.id}
        value={cellData.type === 'number' ? (cellData.value > 0 ? cellData.value : '') : cellData.value}
        onChange={onEditItem}
        label={cellData.label}
        error={Boolean(cellData.errors && cellData.touched)}
        slotProps={{
          htmlInput: {
            ...(cellData.align === 'right' && { style: { textAlign: 'right' } }),
            ...(cellData.type === 'number' && { step: 'any', min: 0 })
          }
        }}
      />
    </TableCell>
  );
}
