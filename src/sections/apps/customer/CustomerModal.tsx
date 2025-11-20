import { useCallback, useMemo } from 'react';

// material-ui
import Modal from '@mui/material/Modal';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';

// project-imports
import FormCustomerAdd from './FormCustomerAdd';
import { useGetCustomer } from 'api/customer';
import CircularWithPath from 'components/@extended/progress/CircularWithPath';
import MainCard from 'components/MainCard';
import SimpleBar from 'components/third-party/SimpleBar';

// types
import { CustomerList } from 'types/customer';

interface Props {
  open: boolean;
  modalToggler: (state: boolean) => void;
  customer?: CustomerList | null;
}

// ==============================|| CUSTOMER ADD / EDIT ||============================== //

export default function CustomerModal({ open, modalToggler, customer }: Props) {
  const { customersLoading: loading } = useGetCustomer();

  const closeModal = useCallback(() => modalToggler(false), [modalToggler]);

  const customerForm = useMemo(
    () => !loading && <FormCustomerAdd customer={customer || null} closeModal={closeModal} />,
    [customer, loading, closeModal]
  );

  return (
    <>
      {open && (
        <Modal
          open={open}
          onClose={closeModal}
          aria-labelledby="modal-customer-add-label"
          aria-describedby="modal-customer-add-description"
          sx={{ '& .MuiPaper-root:focus': { outline: 'none' } }}
        >
          <MainCard
            sx={{ minWidth: { xs: 340, sm: 600, md: 880 }, maxWidth: 880, height: 'auto', maxHeight: 'calc(100vh - 48px)' }}
            modal
            content={false}
          >
            <SimpleBar
              sx={{ width: 1, maxHeight: `calc(100vh - 48px)`, '& .simplebar-content': { display: 'flex', flexDirection: 'column' } }}
            >
              {loading ? (
                <Box sx={{ p: 5 }}>
                  <Stack direction="row" sx={{ justifyContent: 'center' }}>
                    <CircularWithPath />
                  </Stack>
                </Box>
              ) : (
                customerForm
              )}
            </SimpleBar>
          </MainCard>
        </Modal>
      )}
    </>
  );
}
