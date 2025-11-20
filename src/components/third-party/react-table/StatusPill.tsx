// material-ui
import Chip from '@mui/material/Chip';

// ==============================|| STATUS PILL ||============================== //

export default function StatusPill({ status }: { status: string }) {
  switch (status) {
    case 'Complicated':
      return <Chip color="error" label="Complicated" size="small" variant="light" />;
    case 'Relationship':
      return <Chip color="success" label="Relationship" size="small" variant="light" />;
    case 'Single':
    default:
      return <Chip color="info" label="Single" size="small" variant="light" />;
  }
}
