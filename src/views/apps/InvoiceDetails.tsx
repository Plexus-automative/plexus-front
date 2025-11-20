'use client';

import { useEffect, useState, useRef, Ref } from 'react';

// next
import { useRouter } from 'next/navigation';

// material-ui
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import FormControl from '@mui/material/FormControl';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableContainer from '@mui/material/TableContainer';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

// third-party
import { PDFDownloadLink } from '@react-pdf/renderer';
import { useReactToPrint } from 'react-to-print';

// project-imports
import Breadcrumbs from 'components/@extended/Breadcrumbs';
import MainCard from 'components/MainCard';
import LogoSection from 'components/logo';

import { useGetInvoice, useGetInvoiceMaster } from 'api/invoice';
import { handlerActiveItem, useGetMenuMaster } from 'api/menu';
import { APP_DEFAULT_PATH } from 'config';
import ExportPDFView from 'sections/apps/invoice/export-pdf';

// assets
import { DocumentDownload, Edit, Printer, Share } from '@wandersonalwes/iconsax-react';

// types
import { InvoiceList } from 'types/invoice';

function PDFIconButton({ list }: { list: InvoiceList }) {
  return (
    <PDFDownloadLink document={<ExportPDFView list={list} />} fileName={`${list.invoice_id}-${list.customer_name}.pdf`}>
      <Tooltip title="Download">
        <IconButton color="secondary">
          <DocumentDownload />
        </IconButton>
      </Tooltip>
    </PDFDownloadLink>
  );
}

// ==============================|| INVOICE - DETAILS ||============================== //

type Props = {
  id: string;
};

export default function Details({ id }: Props) {
  const router = useRouter();

  const { menuMaster } = useGetMenuMaster();
  const { invoiceLoading, invoice } = useGetInvoice();
  const { invoiceMaster, invoiceMasterLoading } = useGetInvoiceMaster();
  const [list, seList] = useState<InvoiceList | null>(null);

  useEffect(() => {
    if (menuMaster.openedItem !== 'invoice-details') handlerActiveItem('invoice-details');
    if (id && !invoiceLoading) {
      seList(invoice.filter((item: InvoiceList) => item.id.toString() === id)[0] || invoice[0]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, invoiceLoading]);

  const today = new Date(`${list?.date}`).toLocaleDateString('en-GB', {
    month: 'numeric',
    day: 'numeric',
    year: 'numeric'
  });

  const due_dates = new Date(`${list?.due_date}`).toLocaleDateString('en-GB', {
    month: 'numeric',
    day: 'numeric',
    year: 'numeric'
  });

  const subtotal = list?.invoice_detail?.reduce((prev: any, curr: any) => {
    if (curr.name.trim().length > 0) return prev + Number(curr.price * Math.floor(curr.qty));
    else return prev;
  }, 0);

  const taxRate = (Number(list?.tax) * subtotal) / 100;
  const discountRate = (Number(list?.discount) * subtotal) / 100;
  const total = subtotal - discountRate + taxRate;

  const contentRef: Ref<HTMLDivElement> = useRef(null);
  const reactToPrintFn = useReactToPrint({ contentRef });

  const isLoader = invoiceLoading || invoiceMasterLoading || invoiceMaster === undefined || list === null;

  const breadcrumbLinks = [
    { title: 'home', to: APP_DEFAULT_PATH },
    { title: 'invoice', to: '/apps/invoice/dashboard' },
    { title: 'details' }
  ];

  return (
    <>
      <Breadcrumbs custom heading="invoice-summary" links={breadcrumbLinks} />
      <MainCard content={false}>
        <Stack sx={{ gap: 2.5 }}>
          <Box sx={{ p: 2.5, pb: 0 }}>
            <MainCard content={false} border={false} sx={{ p: 1.25, bgcolor: 'secondary.lighter' }}>
              <Stack direction="row" sx={{ gap: 1, justifyContent: 'flex-end' }}>
                <Tooltip title="Edit">
                  <IconButton color="secondary" onClick={() => router.push(`/apps/invoice/edit/${id}`)}>
                    <Edit />
                  </IconButton>
                </Tooltip>
                {isLoader ? <Button loading>X</Button> : <PDFIconButton {...{ list }} />}
                <Tooltip title="Print">
                  <IconButton color="secondary" onClick={() => reactToPrintFn()}>
                    <Printer />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Share">
                  <IconButton color="secondary">
                    <Share />
                  </IconButton>
                </Tooltip>
              </Stack>
            </MainCard>
          </Box>
          <Box sx={{ p: 2.5, bgcolor: 'background.paper' }} id="print" ref={contentRef}>
            <Grid container spacing={2.5}>
              <Grid size={12}>
                <Stack direction={{ xs: 'column', sm: 'row' }} sx={{ justifyContent: 'space-between' }}>
                  <Stack sx={{ gap: 0.5 }}>
                    <Stack direction="row" sx={{ gap: 2 }}>
                      <LogoSection />
                      <Chip label="Paid" variant="light" color="success" size="small" />
                    </Stack>
                    <Typography sx={{ color: 'secondary.main' }}>{isLoader ? <Skeleton /> : `#${list.invoice_id}`}</Typography>
                  </Stack>
                  <Box>
                    <Stack direction="row" sx={{ gap: 1, justifyContent: 'flex-end' }}>
                      <Typography variant="subtitle1">Date</Typography>
                      <Typography sx={{ color: 'secondary.main' }}>{today}</Typography>
                    </Stack>
                    <Stack direction="row" sx={{ gap: 1, justifyContent: 'flex-end' }}>
                      <Typography sx={{ overflow: 'hidden' }} variant="subtitle1">
                        Due Date
                      </Typography>
                      <Typography sx={{ color: 'secondary.main' }}>{due_dates}</Typography>
                    </Stack>
                  </Box>
                </Stack>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <MainCard>
                  <Stack sx={{ gap: 1 }}>
                    <Typography variant="h5">From:</Typography>
                    {isLoader ? (
                      <Stack sx={{ gap: 0.5 }}>
                        <Skeleton />
                        <Skeleton width={60} />
                        <Skeleton />
                      </Stack>
                    ) : (
                      <FormControl sx={{ width: 1 }}>
                        <Typography sx={{ color: 'secondary.main' }}>{list.cashierInfo.name}</Typography>
                        <Typography sx={{ color: 'secondary.main' }}>{list.cashierInfo.address}</Typography>
                        <Typography sx={{ color: 'secondary.main' }}>{list.cashierInfo.phone}</Typography>
                        <Typography sx={{ color: 'secondary.main' }}>{list.cashierInfo.email}</Typography>
                      </FormControl>
                    )}
                  </Stack>
                </MainCard>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <MainCard>
                  <Stack sx={{ gap: 1 }}>
                    <Typography variant="h5">To:</Typography>
                    {isLoader ? (
                      <Stack sx={{ gap: 0.5 }}>
                        <Skeleton />
                        <Skeleton width={60} />
                        <Skeleton />
                      </Stack>
                    ) : (
                      <FormControl sx={{ width: 1 }}>
                        <Typography sx={{ color: 'secondary.main' }}>{list.customerInfo.name}</Typography>
                        <Typography sx={{ color: 'secondary.main' }}>{list.customerInfo.address}</Typography>
                        <Typography sx={{ color: 'secondary.main' }}>{list.customerInfo.phone}</Typography>
                        <Typography sx={{ color: 'secondary.main' }}>{list.customerInfo.email}</Typography>
                      </FormControl>
                    )}
                  </Stack>
                </MainCard>
              </Grid>
              <Grid size={12}>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>#</TableCell>
                        <TableCell>Name</TableCell>
                        <TableCell>Description</TableCell>
                        <TableCell align="right">Qty</TableCell>
                        <TableCell align="right">Price</TableCell>
                        <TableCell align="right">Amount</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {isLoader &&
                        [1, 2, 3].map((row: number) => (
                          <TableRow key={row} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                            <TableCell>
                              <Skeleton />
                            </TableCell>
                            <TableCell>
                              <Skeleton />
                            </TableCell>
                            <TableCell>
                              <Skeleton />
                            </TableCell>
                            <TableCell>
                              <Skeleton />
                            </TableCell>
                            <TableCell>
                              <Skeleton />
                            </TableCell>
                            <TableCell>
                              <Skeleton />
                            </TableCell>
                          </TableRow>
                        ))}
                      {!isLoader &&
                        list.invoice_detail?.map((row: any, index: number) => (
                          <TableRow key={row.name} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                            <TableCell>{index + 1}</TableCell>
                            <TableCell>{row.name}</TableCell>
                            <TableCell>{row.description}</TableCell>
                            <TableCell align="right">{row.qty}</TableCell>
                            <TableCell align="right">{invoiceMaster.country?.prefix + '' + Number(row.price).toFixed(2)}</TableCell>
                            <TableCell align="right">
                              {invoiceMaster.country?.prefix + '' + Number(row.price * row.qty).toFixed(2)}
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Grid>
              <Grid size={12}>
                <Divider sx={{ borderWidth: 1 }} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 8 }}></Grid>
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <Stack sx={{ gap: 2 }}>
                  <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
                    <Typography sx={{ color: 'secondary.main' }}>Sub Total:</Typography>
                    <Typography>
                      {isLoader ? <Skeleton width={80} /> : invoiceMaster.country?.prefix + '' + subtotal?.toFixed(2)}
                    </Typography>
                  </Stack>
                  <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
                    <Typography sx={{ color: 'secondary.main' }}>Discount:</Typography>
                    <Typography variant="h6" sx={{ color: 'success.main' }}>
                      {isLoader ? <Skeleton width={50} /> : invoiceMaster.country?.prefix + '' + discountRate?.toFixed(2)}
                    </Typography>
                  </Stack>
                  <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
                    <Typography sx={{ color: 'secondary.main' }}>Tax:</Typography>
                    <Typography>{isLoader ? <Skeleton width={60} /> : invoiceMaster.country?.prefix + '' + taxRate?.toFixed(2)}</Typography>
                  </Stack>
                  <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
                    <Typography variant="subtitle1">Grand Total:</Typography>
                    <Typography variant="subtitle1">
                      {isLoader ? (
                        <Skeleton width={100} />
                      ) : total % 1 === 0 ? (
                        invoiceMaster.country?.prefix + '' + total
                      ) : (
                        invoiceMaster.country?.prefix + '' + total?.toFixed(2)
                      )}
                    </Typography>
                  </Stack>
                </Stack>
              </Grid>
              <Grid size={12}>
                <Stack direction="row" sx={{ gap: 1 }}>
                  <Typography sx={{ color: 'secondary.main' }}>Notes: </Typography>
                  <Typography>
                    It was a pleasure working with you and your team. We hope you will keep us in mind for future freelance projects. Thank
                    You!
                  </Typography>
                </Stack>
              </Grid>
            </Grid>
          </Box>
          <Stack direction="row" sx={{ gap: 2, justifyContent: 'flex-end', p: 2.5, a: { textDecoration: 'none', color: 'inherit' } }}>
            <PDFDownloadLink document={<ExportPDFView list={list} />} fileName={`${list?.invoice_id}-${list?.customer_name}.pdf`}>
              <Button loading={isLoader} color="primary" variant="contained" loadingPosition="center">
                Download
              </Button>
            </PDFDownloadLink>
          </Stack>
        </Stack>
      </MainCard>
    </>
  );
}
