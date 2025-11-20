import { useEffect, useMemo, useState } from 'react';

// material-ui
import Modal from '@mui/material/Modal';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';

// project-imports
import FormCustomerAdd from './FormCustomerAdd';
import { handlerCustomerDialog, useGetCustomer, useGetCustomerMaster } from 'api/customer';
import CircularWithPath from 'components/@extended/progress/CircularWithPath';
import MainCard from 'components/MainCard';
import SimpleBar from 'components/third-party/SimpleBar';

// types
import { CustomerList } from 'types/customer';

// ==============================|| CUSTOMER ADD / EDIT ||============================== //

export default function AddCustomer() {
  const { customerMasterLoading, customerMaster } = useGetCustomerMaster();
  const { customersLoading: loading, customers } = useGetCustomer();
  const isModal = customerMaster?.modal;

  const [list, setList] = useState<CustomerList | null>(null);

  useEffect(() => {
    if (customerMaster?.modal && typeof customerMaster.modal === 'number') {
      const newList = customers.filter((info) => info.id === isModal && info)[0];
      setList(newList);
    } else {
      setList(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customerMaster]);

  const closeModal = () => handlerCustomerDialog(false);

  const customerForm = useMemo(
    () => !loading && !customerMasterLoading && <FormCustomerAdd customer={list} closeModal={closeModal} />,
    [list, loading, customerMasterLoading]
  );

  return (
    <>
      {isModal && (
        <Modal
          open={true}
          onClose={closeModal}
          aria-labelledby="modal-customer-add-label"
          aria-describedby="modal-customer-add-description"
          sx={{ '& .MuiPaper-root:focus': { outline: 'none' } }}
        >
          <MainCard
            sx={{ minWidth: { xs: 320, sm: 600, md: 768 }, maxWidth: 768, height: 'auto', maxHeight: 'calc(100vh - 48px)' }}
            modal
            content={false}
          >
            <SimpleBar
              sx={{
                maxHeight: `calc(100vh - 48px)`,
                '& .simplebar-content': {
                  display: 'flex',
                  flexDirection: 'column'
                }
              }}
            >
              {loading && customerMasterLoading ? (
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
