// material-ui
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';

// assets
import { ArrowDown2, ArrowUp2 } from '@wandersonalwes/iconsax-react';

// types
import { Column } from '@tanstack/react-table';

enum SortType {
  ASC = 'asc',
  DESC = 'desc'
}

function SortToggler({ type }: { type?: SortType }) {
  return (
    <Stack
      sx={{
        fontSize: '0.625rem',
        color: 'secondary.light',
        ...(type === SortType.ASC && { '& .caret-up': { color: 'secondary.main' } }),
        ...(type === SortType.DESC && { '& .caret-down': { color: 'secondary.main' } })
      }}
    >
      <ArrowUp2 className="caret-up" size="15" variant="Bold" style={{ fontSize: '0.625rem' }} />
      <ArrowDown2 className="caret-down" size="15" variant="Bold" style={{ fontSize: '0.625rem', marginTop: -8 }} />
    </Stack>
  );
}

interface HeaderSortProps {
  column: Column<any, unknown>;
  sort?: boolean;
}

// ==============================|| SORT HEADER ||============================== //

export default function HeaderSort({ column, sort = true }: HeaderSortProps) {
  return (
    <Box {...(sort && { onClick: column.getToggleSortingHandler(), sx: { cursor: 'pointer' } })}>
      {{
        asc: <SortToggler type={SortType.ASC} />,
        desc: <SortToggler type={SortType.DESC} />
      }[column.getIsSorted() as string] ?? <SortToggler />}
    </Box>
  );
}
