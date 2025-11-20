'use client';

import { useState } from 'react';

// material-ui
import Grid from '@mui/material/Grid';
import Badge from '@mui/material/Badge';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import Typography from '@mui/material/Typography';

// project-imports
import AntAvatar from 'components/@extended/Avatar';
import ComponentHeader from 'components/cards/ComponentHeader';
import MainCard from 'components/MainCard';
import { GRID_COMMON_SPACING } from 'config';

import ComponentWrapper from 'sections/components-overview/ComponentWrapper';

// assets
import { Add, Minus, Profile, Sms } from '@wandersonalwes/iconsax-react';

// ==============================|| COMPONENTS - BADGES ||============================== //

export default function ComponentBadge() {
  const [count, setCount] = useState(1);
  const [invisible, setInvisible] = useState(false);

  const handleBadgeVisibility = () => {
    setInvisible(!invisible);
  };

  const basicBadgesCodeString = `<Badge badgeContent={4} color="primary"><Sms /></Badge>
<Badge badgeContent={4} color="secondary"><Sms /></Badge>
<Badge badgeContent={4} color="success"><Sms /></Badge>
<Badge badgeContent={4} color="warning"><Sms /></Badge>
<Badge badgeContent={4} color="info"><Sms /></Badge>
<Badge badgeContent={4} color="error"><Sms /></Badge>`;

  const lightBadgesCodeString = `<Badge badgeContent={4} color="primary" variant="light"><Sms /></Badge>
<Badge badgeContent={4} color="secondary" variant="light"><Sms /></Badge>
<Badge badgeContent={4} color="success" variant="light"><Sms /></Badge>
<Badge badgeContent={4} color="warning" variant="light"><Sms /></Badge>
<Badge badgeContent={4} color="info" variant="light"><Sms /></Badge>
<Badge badgeContent={4} color="error" variant="light"><Sms /></Badge>`;

  const maxBadgesCodeString = `<Badge badgeContent={99} color="primary"><Sms /></Badge>
<Badge badgeContent={100} color="secondary"><Sms /></Badge>
<Badge badgeContent={1000} max={999} color="primary" variant="light"><Sms /></Badge>
<Badge badgeContent={99} color="secondary" variant="light"><Sms /></Badge>
<Badge badgeContent={99} color="error"><Sms /></Badge>`;

  const dotBadgesCodeString = `<Badge color="primary" variant="dot"><Sms /></Badge>
<Badge color="secondary" variant="dot"><Sms /></Badge>
<Badge max={999} color="success" variant="dot"><Sms /></Badge>
<Badge color="warning" variant="dot"><Sms /></Badge>
<Badge color="info" variant="dot"><Sms /></Badge>
<Badge color="error" variant="dot"><Typography variant="h6">Typography</Typography></Badge>`;

  const alignmentBadgesCodeString = `<Badge badgeContent={9} color="primary">
  <Sms />
</Badge>
<Badge color="primary" variant="dot">
  <Sms />
</Badge>
<Badge
  badgeContent={9}
  color="primary"
  anchorOrigin={{
    vertical: 'bottom',
    horizontal: 'right'
  }}
>
  <Sms />
</Badge>
<Badge
  badgeContent={9}
  color="primary"
  anchorOrigin={{
    vertical: 'top',
    horizontal: 'left'
  }}
>
  <Sms />
</Badge>
<Badge
  badgeContent={99}
  color="primary"
  anchorOrigin={{
    vertical: 'bottom',
    horizontal: 'left'
  }}
>
  <Sms />
</Badge>`;

  const overlapBadgesCodeString = `<Badge color="error" overlap="circular" variant="dot">
  <AntAvatar alt="Basic">
    <Profile variant="Bold" />
  </AntAvatar>
</Badge>
<Badge color="error" variant="dot">
  <AntAvatar alt="Basic" variant="rounded" type="filled">
    <Profile />
  </AntAvatar>
</Badge>
<Badge color="error" variant="dot">
  <AntAvatar alt="Basic" variant="square" type="outlined">
    <Profile variant="Bold" />
  </AntAvatar>
</Badge>
<Badge badgeContent=" " color="error" overlap="circular">
  <AntAvatar alt="Basic" type="outlined">
    U
  </AntAvatar>
</Badge>
<Badge badgeContent=" " color="error">
  <AntAvatar alt="Basic" variant="rounded" type="filled">
    U
  </AntAvatar>
</Badge>
<Badge badgeContent=" " color="error">
  <AntAvatar alt="Basic" variant="square" type="outlined">
    U
  </AntAvatar>
</Badge>`;

  const visibleBadgesCodeString = `<Badge color="primary" badgeContent={count}><Sms /></Badge>
<ButtonGroup>
  <Button
    aria-label="reduce"
    onClick={() => {
      setCount(Math.max(count - 1, 0));
    }}
  >
    <Minus />
  </Button>
  <Button
    aria-label="increase"
    onClick={() => {
      setCount(count + 1);
    }}
  >
    <Add />
  </Button>
</ButtonGroup>
<Badge color="primary" variant="dot" invisible={invisible}><Sms /></Badge>
<FormControlLabel
  sx={{ color: 'text.primary' }}
  control={<Switch checked={!invisible} onChange={handleBadgeVisibility} />}
  label="Show Badge"
  labelPlacement="start"
/>`;

  return (
    <>
      <ComponentHeader
        title="Badge"
        caption="Badge generates a small badge to the top-right of its child(ren)."
        directory="src/pages/components-overview/badges"
        link="https://mui.com/material-ui/react-badge/"
      />
      <ComponentWrapper>
        <Grid container spacing={GRID_COMMON_SPACING}>
          <Grid size={{ xs: 12, lg: 6 }}>
            <MainCard title="Basic" codeHighlight codeString={basicBadgesCodeString}>
              <Grid container spacing={3}>
                <Grid>
                  <Badge badgeContent={4} color="primary">
                    <Sms />
                  </Badge>
                </Grid>
                <Grid>
                  <Badge badgeContent={4} color="secondary">
                    <Sms />
                  </Badge>
                </Grid>
                <Grid>
                  <Badge badgeContent={4} color="success">
                    <Sms />
                  </Badge>
                </Grid>
                <Grid>
                  <Badge badgeContent={4} color="warning">
                    <Sms />
                  </Badge>
                </Grid>
                <Grid>
                  <Badge badgeContent={4} color="info">
                    <Sms />
                  </Badge>
                </Grid>
                <Grid>
                  <Badge badgeContent={4} color="error">
                    <Sms />
                  </Badge>
                </Grid>
              </Grid>
            </MainCard>
          </Grid>
          <Grid size={{ xs: 12, lg: 6 }}>
            <MainCard title="Light" codeString={lightBadgesCodeString}>
              <Grid container spacing={3}>
                <Grid>
                  <Badge badgeContent={4} color="primary" variant="light">
                    <Sms />
                  </Badge>
                </Grid>
                <Grid>
                  <Badge badgeContent={4} color="secondary" variant="light">
                    <Sms />
                  </Badge>
                </Grid>
                <Grid>
                  <Badge badgeContent={4} color="success" variant="light">
                    <Sms />
                  </Badge>
                </Grid>
                <Grid>
                  <Badge badgeContent={4} color="warning" variant="light">
                    <Sms />
                  </Badge>
                </Grid>
                <Grid>
                  <Badge badgeContent={4} color="info" variant="light">
                    <Sms />
                  </Badge>
                </Grid>
                <Grid>
                  <Badge badgeContent={4} color="error" variant="light">
                    <Sms />
                  </Badge>
                </Grid>
              </Grid>
            </MainCard>
          </Grid>
          <Grid size={{ xs: 12, lg: 6 }}>
            <MainCard title="Maximmum Value" codeString={maxBadgesCodeString}>
              <Grid container spacing={4}>
                <Grid>
                  <Badge badgeContent={99} color="primary">
                    <Sms />
                  </Badge>
                </Grid>
                <Grid>
                  <Badge badgeContent={100} color="secondary">
                    <Sms />
                  </Badge>
                </Grid>
                <Grid>
                  <Badge badgeContent={1000} max={999} color="primary" variant="light">
                    <Sms />
                  </Badge>
                </Grid>
                <Grid>
                  <Badge badgeContent={99} color="secondary" variant="light">
                    <Sms />
                  </Badge>
                </Grid>
                <Grid>
                  <Badge badgeContent={99} color="error">
                    <Sms />
                  </Badge>
                </Grid>
              </Grid>
            </MainCard>
          </Grid>
          <Grid size={{ xs: 12, lg: 6 }}>
            <MainCard title="Dot Badges" codeString={dotBadgesCodeString}>
              <Grid container spacing={3}>
                <Grid>
                  <Badge color="primary" variant="dot">
                    <Sms />
                  </Badge>
                </Grid>
                <Grid>
                  <Badge color="secondary" variant="dot">
                    <Sms />
                  </Badge>
                </Grid>
                <Grid>
                  <Badge max={999} color="success" variant="dot">
                    <Sms />
                  </Badge>
                </Grid>
                <Grid>
                  <Badge color="warning" variant="dot">
                    <Sms />
                  </Badge>
                </Grid>
                <Grid>
                  <Badge color="info" variant="dot">
                    <Sms />
                  </Badge>
                </Grid>
                <Grid>
                  <Badge color="error" variant="dot">
                    <Typography variant="h6">Typography</Typography>
                  </Badge>
                </Grid>
              </Grid>
            </MainCard>
          </Grid>
          <Grid size={{ xs: 12, lg: 6 }}>
            <MainCard title="Alignment" codeString={alignmentBadgesCodeString}>
              <Grid container spacing={4}>
                <Grid>
                  <Badge badgeContent={9} color="primary">
                    <Sms />
                  </Badge>
                </Grid>
                <Grid>
                  <Badge color="primary" variant="dot">
                    <Sms />
                  </Badge>
                </Grid>
                <Grid>
                  <Badge
                    badgeContent={9}
                    color="primary"
                    anchorOrigin={{
                      vertical: 'bottom',
                      horizontal: 'right'
                    }}
                  >
                    <Sms />
                  </Badge>
                </Grid>
                <Grid>
                  <Badge
                    badgeContent={9}
                    color="primary"
                    anchorOrigin={{
                      vertical: 'top',
                      horizontal: 'left'
                    }}
                  >
                    <Sms />
                  </Badge>
                </Grid>
                <Grid>
                  <Badge
                    badgeContent={99}
                    color="primary"
                    anchorOrigin={{
                      vertical: 'bottom',
                      horizontal: 'left'
                    }}
                  >
                    <Sms />
                  </Badge>
                </Grid>
              </Grid>
            </MainCard>
          </Grid>
          <Grid size={{ xs: 12, lg: 6 }}>
            <MainCard title="Overlap" codeString={overlapBadgesCodeString}>
              <Grid container spacing={2}>
                <Grid>
                  <Badge color="error" overlap="circular" variant="dot">
                    <AntAvatar alt="Basic">
                      <Profile variant="Bold" />
                    </AntAvatar>
                  </Badge>
                </Grid>
                <Grid>
                  <Badge color="error" variant="dot">
                    <AntAvatar alt="Basic" variant="rounded" type="filled">
                      <Profile />
                    </AntAvatar>
                  </Badge>
                </Grid>
                <Grid>
                  <Badge color="error" variant="dot">
                    <AntAvatar alt="Basic" variant="square" type="outlined">
                      <Profile variant="Bold" />
                    </AntAvatar>
                  </Badge>
                </Grid>
                <Grid>
                  <Badge badgeContent=" " color="error" overlap="circular">
                    <AntAvatar alt="Basic" type="outlined">
                      U
                    </AntAvatar>
                  </Badge>
                </Grid>
                <Grid>
                  <Badge badgeContent=" " color="error">
                    <AntAvatar alt="Basic" variant="rounded" type="filled">
                      U
                    </AntAvatar>
                  </Badge>
                </Grid>
                <Grid>
                  <Badge badgeContent=" " color="error">
                    <AntAvatar alt="Basic" variant="square" type="outlined">
                      U
                    </AntAvatar>
                  </Badge>
                </Grid>
              </Grid>
            </MainCard>
          </Grid>
          <Grid size={{ xs: 12, lg: 6 }}>
            <MainCard title="Visibility" codeString={visibleBadgesCodeString}>
              <Grid container spacing={2}>
                <Grid size={12}>
                  <Stack direction="row" sx={{ gap: 3, alignItems: 'center' }}>
                    <Badge color="primary" badgeContent={count}>
                      <Sms />
                    </Badge>
                    <ButtonGroup>
                      <Button
                        aria-label="reduce"
                        onClick={() => {
                          setCount(Math.max(count - 1, 0));
                        }}
                      >
                        <Minus />
                      </Button>
                      <Button
                        aria-label="increase"
                        onClick={() => {
                          setCount(count + 1);
                        }}
                      >
                        <Add />
                      </Button>
                    </ButtonGroup>
                  </Stack>
                </Grid>
                <Grid size={12}>
                  <Stack direction="row" sx={{ gap: 3, alignItems: 'center' }}>
                    <Badge color="primary" variant="dot" invisible={invisible}>
                      <Sms />
                    </Badge>
                    <FormControlLabel
                      sx={{ color: 'text.primary' }}
                      control={<Switch checked={!invisible} onChange={handleBadgeVisibility} />}
                      label="Show Badge"
                      labelPlacement="start"
                    />
                  </Stack>
                </Grid>
              </Grid>
            </MainCard>
          </Grid>
        </Grid>
      </ComponentWrapper>
    </>
  );
}
