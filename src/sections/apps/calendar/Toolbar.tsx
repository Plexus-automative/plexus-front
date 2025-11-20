import { useState, useEffect } from 'react';

// material-ui
import { Theme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';

// third-party
import { format } from 'date-fns';

// project-imports
import IconButton from 'components/@extended/IconButton';

// assets
import { ArrowLeft2, ArrowRight2, Calendar1, Category, Grid6, TableDocument } from '@wandersonalwes/iconsax-react';

// constant
const viewOptions = [
  {
    label: 'Month',
    value: 'dayGridMonth',
    icon: Category
  },
  {
    label: 'Week',
    value: 'timeGridWeek',
    icon: Grid6
  },
  {
    label: 'Day',
    value: 'timeGridDay',
    icon: Calendar1
  },
  {
    label: 'Agenda',
    value: 'listWeek',
    icon: TableDocument
  }
];

// ==============================|| CALENDAR - TOOLBAR ||============================== //

interface ToolbarProps {
  date: number | Date;
  view: string;
  onClickNext: () => void;
  onClickPrev: () => void;
  onClickToday: () => void;
  onChangeView: (s: string) => void;
}

export default function Toolbar({ date, view, onClickNext, onClickPrev, onClickToday, onChangeView, ...others }: ToolbarProps) {
  const downSM = useMediaQuery((theme: Theme) => theme.breakpoints.down('sm'));

  const [viewFilter, setViewFilter] = useState(viewOptions);

  useEffect(() => {
    if (downSM) {
      const filter = viewOptions.filter((item) => item.value !== 'dayGridMonth' && item.value !== 'timeGridWeek');
      setViewFilter(filter);
    } else {
      setViewFilter(viewOptions);
    }
  }, [downSM]);

  return (
    <Grid container spacing={downSM ? 1 : 3} {...others} sx={{ alignItems: 'center', justifyContent: 'space-between', pb: 3 }}>
      <Grid>
        <Button variant="outlined" onClick={onClickToday} size={downSM ? 'small' : 'medium'}>
          Today
        </Button>
      </Grid>
      <Grid>
        <Stack direction="row" sx={{ gap: { xs: 1, sm: 3 }, alignItems: 'center' }}>
          <IconButton onClick={onClickPrev} size={downSM ? 'small' : 'large'}>
            <ArrowLeft2 />
          </IconButton>
          <Typography variant={downSM ? 'h5' : 'h3'} sx={{ color: 'text.primary' }}>
            {format(date, 'MMMM yyyy')}
          </Typography>
          <IconButton onClick={onClickNext} size={downSM ? 'small' : 'large'}>
            <ArrowRight2 />
          </IconButton>
        </Stack>
      </Grid>
      <Grid>
        <ButtonGroup variant="outlined" aria-label="outlined button group">
          {viewFilter.map((viewOption) => {
            const Icon = viewOption.icon;
            return (
              <Tooltip title={viewOption.label} key={viewOption.value}>
                <Button
                  size={downSM ? 'small' : 'large'}
                  disableElevation
                  variant={viewOption.value === view ? 'contained' : 'outlined'}
                  onClick={() => onChangeView(viewOption.value)}
                >
                  <Icon variant={viewOption.value === view ? 'Bold' : 'Linear'} />
                </Button>
              </Tooltip>
            );
          })}
        </ButtonGroup>
      </Grid>
    </Grid>
  );
}
