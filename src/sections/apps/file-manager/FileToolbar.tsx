import { useState } from 'react';

// material-ui
import Button from '@mui/material/Button';
import Fab from '@mui/material/Fab';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

// project-imports
import UploadFile from './UploadFile';

// assets
import { Add, ArrowRight2 } from '@wandersonalwes/iconsax-react';

// ==============================|| FILE MANAGER - FILE TOOLBAR ||============================== //

export default function FileToolbar({ selectedItems }: { selectedItems: number[] }) {
  const [openUpload, setOpenUpload] = useState(false);
  return (
    <>
      <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
        <Stack direction="row" sx={{ alignItems: 'center', gap: 1 }}>
          <Typography variant="h5">File</Typography>
          <Fab
            color="primary"
            size="small"
            aria-label="add"
            sx={{ width: 32, minHeight: 32, height: 32 }}
            onClick={() => setOpenUpload(true)}
          >
            <Add size="20" />
          </Fab>
        </Stack>
        <Stack direction="row" sx={{ alignItems: 'center', gap: 1 }}>
          {selectedItems.length > 0 && (
            <Button variant="outlined" color="error">
              Delete
            </Button>
          )}
          <Button variant="outlined" color="secondary">
            <Stack direction="row" sx={{ gap: 1, alignItems: 'center' }}>
              View all
              <ArrowRight2 size="18" />
            </Stack>
          </Button>
        </Stack>
      </Stack>
      <UploadFile openUpload={openUpload} setOpenUpload={setOpenUpload} />
    </>
  );
}
