'use client';

import { useState } from 'react';

// material-ui
import CardActions from '@mui/material/CardActions';
import Collapse from '@mui/material/Collapse';
import Divider from '@mui/material/Divider';
import Tooltip from '@mui/material/Tooltip';
import Box from '@mui/material/Box';

// third-party
import copy from 'copy-to-clipboard';

// project-imports
import IconButton from 'components/@extended/IconButton';
import SyntaxHighlight from 'utils/SyntaxHighlight';

// assets
import { Code, Copy } from '@wandersonalwes/iconsax-react';

interface Props {
  codeString: string;
  codeHighlight: boolean;
}

// ==============================|| CLIPBOARD & HIGHLIGHTER ||============================== //

export default function Highlighter({ codeString, codeHighlight }: Props) {
  const [highlight, setHighlight] = useState(codeHighlight);

  return (
    <>
      <CardActions sx={{ justifyContent: 'flex-end' }}>
        <Box sx={{ display: 'flex' }}>
          <Tooltip title="Copy the source" placement="top-end">
            <IconButton color="secondary" size="small" onClick={() => copy(codeString)}>
              <Copy />
            </IconButton>
          </Tooltip>
          <Divider orientation="vertical" variant="middle" flexItem sx={{ mx: 1 }} />
          <Tooltip title="Show the source" placement="top-end">
            <IconButton
              sx={{ fontSize: '0.875rem' }}
              size="small"
              color={highlight ? 'primary' : 'secondary'}
              onClick={() => setHighlight(!highlight)}
            >
              <Code />
            </IconButton>
          </Tooltip>
        </Box>
      </CardActions>
      <Collapse in={highlight}>{highlight && <SyntaxHighlight>{codeString}</SyntaxHighlight>}</Collapse>
    </>
  );
}
