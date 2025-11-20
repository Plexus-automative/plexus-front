import { useState } from 'react';

// material-ui
import Button from '@mui/material/Button';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import TableCell from '@mui/material/TableCell';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

// third-party
import { FormikErrors, FormikTouched, getIn } from 'formik';

// project-imports
import InvoiceField from './InvoiceField';
import AlertProductDelete from './AlertProductDelete';
import { useGetInvoiceMaster } from 'api/invoice';
import { openSnackbar } from 'api/snackbar';

// assets
import { Trash } from '@wandersonalwes/iconsax-react';

// types
import { CountryType, Items } from 'types/invoice';
import { SnackbarProps } from 'types/snackbar';

interface FormValue {
  id: number;
  invoice_id: number;
  status: string;
  date: Date;
  due_date: Date;
  cashierInfo: { name: string; address: string; phone: string; email: string };
  customerInfo: { address: string; email: string; name: string; phone: string };
  invoice_detail: Items[];
  discount: number;
  tax: number;
  notes: string;
}

interface InvoiceItemProps {
  id: string;
  name: string;
  description: string;
  qty: number;
  price: number;
  onDeleteItem: (index: number) => void;
  onEditItem: (event: React.ChangeEvent<HTMLInputElement>) => void;
  index: number;
  Blur: (event: React.FocusEvent<HTMLInputElement>) => void;
  errors: FormikErrors<FormValue>;
  touched: FormikTouched<FormValue>;
  country?: CountryType | null;
  lastItem: boolean;
}

// ==============================|| INVOICE - ITEMS ||============================== //

export default function InvoiceItem({
  id,
  name,
  description,
  qty,
  price,
  onDeleteItem,
  onEditItem,
  index,
  Blur,
  errors,
  touched,
  country,
  lastItem
}: InvoiceItemProps) {
  const { invoiceMaster } = useGetInvoiceMaster();

  const [open, setOpen] = useState(false);
  const handleModalClose = (status: boolean) => {
    setOpen(false);
    if (status) {
      onDeleteItem(index);
      openSnackbar({
        open: true,
        message: 'Product Deleted successfully',
        anchorOrigin: { vertical: 'top', horizontal: 'right' },
        variant: 'alert',
        alert: { color: 'success' }
      } as SnackbarProps);
    }
  };

  const Name = `invoice_detail[${index}].name`;
  const touchedName = getIn(touched, Name);
  const errorName = getIn(errors, Name);

  const textFieldItem = [
    {
      placeholder: 'Item name',
      label: 'Item Name',
      name: `invoice_detail.${index}.name`,
      type: 'text',
      id: id + '_name',
      value: name,
      errors: errorName,
      touched: touchedName,
      align: 'left'
    },
    {
      placeholder: 'Description',
      label: 'Description',
      name: `invoice_detail.${index}.description`,
      type: 'text',
      id: id + '_description',
      value: description,
      align: 'left'
    },
    { placeholder: '', label: 'Qty', type: 'number', name: `invoice_detail.${index}.qty`, id: id + '_qty', value: qty, align: 'right' },
    {
      placeholder: '',
      label: 'price',
      type: 'number',
      name: `invoice_detail.${index}.price`,
      id: id + '_price',
      value: price,
      align: 'right'
    }
  ];

  return (
    <>
      {textFieldItem.map((item: any) => {
        return (
          <InvoiceField
            onEditItem={(event: any) => onEditItem(event)}
            onBlur={(event: any) => Blur(event)}
            cellData={{
              placeholder: item.placeholder,
              name: item.name,
              type: item.type,
              id: item.id,
              value: item.value,
              errors: item.errors,
              touched: item.touched,
              align: item.align
            }}
            key={item.label}
          />
        );
      })}
      <TableCell>
        <Stack direction="column" sx={{ gap: 2, justifyContent: 'flex-end', alignItems: 'flex-end' }}>
          <Box sx={{ pl: 2 }}>
            {invoiceMaster === undefined ? (
              <Skeleton width={520} height={16} />
            ) : (
              <Typography>
                {country ? `${country.prefix} ${(price * qty).toFixed(2)}` : `${invoiceMaster.country?.prefix} ${(price * qty).toFixed(2)}`}
              </Typography>
            )}
          </Box>
        </Stack>
      </TableCell>
      <TableCell align="center">
        <Tooltip title="Remove Item">
          <Button color="error" onClick={() => setOpen(true)} disabled={lastItem}>
            <Trash />
          </Button>
        </Tooltip>
      </TableCell>
      <AlertProductDelete title={name} open={open} handleClose={handleModalClose} />
    </>
  );
}
