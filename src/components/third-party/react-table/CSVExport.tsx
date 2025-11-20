'use client';

// material-ui
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';

// third-party
import { CSVLink } from 'react-csv';
import { Headers } from 'react-csv/lib/core';

// assets
import { DocumentDownload } from '@wandersonalwes/iconsax-react';

interface CSVExportProps {
  data: never[] | any[];
  filename: string;
  headers?: Headers;
}

// ==============================|| CSV EXPORT ||============================== //

export default function CSVExport({ data, filename, headers }: CSVExportProps) {
  return (
    <CSVLink data={data} filename={filename} headers={headers}>
      <Tooltip title="CSV Export">
        <Stack sx={{ color: 'text.secondary', alignContent: 'center' }}>
          <DocumentDownload size={28} variant="Outline" />
        </Stack>
      </Tooltip>
    </CSVLink>
  );
}
