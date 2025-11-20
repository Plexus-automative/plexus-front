'use client';

import { useState } from 'react';

// material-ui
import { styled } from '@mui/material/styles';
import Button from '@mui/material/Button';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import Fab from '@mui/material/Fab';
import Fade from '@mui/material/Fade';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Tooltip, { tooltipClasses, TooltipProps } from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import Zoom from '@mui/material/Zoom';

// project-imports
import IconButton from 'components/@extended/IconButton';
import CustomTooltip from 'components/@extended/Tooltip';
import ComponentHeader from 'components/cards/ComponentHeader';
import MainCard from 'components/MainCard';
import { GRID_COMMON_SPACING } from 'config';

import ComponentWrapper from 'sections/components-overview/ComponentWrapper';

// assets
import { Add, Trash } from '@wandersonalwes/iconsax-react';

// tooltip
const LightTooltip = styled(({ className, ...props }: TooltipProps) => <Tooltip {...props} classes={{ popper: className }} />)(
  ({ theme }) => ({
    [`& .${tooltipClasses.tooltip}`]: {
      color: theme.palette.text.primary,
      backgroundColor: theme.palette.background.paper,
      ...theme.applyStyles('dark', {
        color: theme.palette.background.paper,
        backgroundColor: theme.palette.text.primary
      }),
      boxShadow: theme.shadows[1],
      fontSize: 11
    }
  })
);
LightTooltip.displayName = 'LightTooltip';

const BootstrapTooltip = styled(({ className, ...props }: TooltipProps) => <Tooltip {...props} arrow classes={{ popper: className }} />)(
  ({ theme }) => ({
    [`& .${tooltipClasses.arrow}`]: {
      color: theme.palette.text.primary
    },
    [`& .${tooltipClasses.tooltip}`]: {
      color: theme.palette.background.paper,
      backgroundColor: theme.palette.text.primary
    }
  })
);
BootstrapTooltip.displayName = 'BootstrapTooltip';

const HtmlTooltip = styled(({ className, ...props }: TooltipProps) => <Tooltip {...props} classes={{ popper: className }} />)(
  ({ theme }) => ({
    [`& .${tooltipClasses.tooltip}`]: {
      backgroundColor: theme.palette.secondary.lighter,
      color: theme.palette.text.primary,
      maxWidth: 220,
      fontSize: theme.typography.pxToRem(12),
      border: '1px solid',
      borderColor: theme.palette.secondary.light
    }
  })
);
HtmlTooltip.displayName = 'HtmlTooltip';

const CustomWidthTooltip = styled(({ className, ...props }: TooltipProps) => <Tooltip {...props} classes={{ popper: className }} />)({
  [`& .${tooltipClasses.tooltip}`]: {
    maxWidth: 500
  }
});
CustomWidthTooltip.displayName = 'CustomWidthTooltip';

const NoMaxWidthTooltip = styled(({ className, ...props }: TooltipProps) => <Tooltip {...props} classes={{ popper: className }} />)({
  [`& .${tooltipClasses.tooltip}`]: {
    maxWidth: 'none'
  }
});
NoMaxWidthTooltip.displayName = 'NoMaxWidthTooltip';

// ==============================|| COMPONENTS - TOOLTIP ||============================== //

export default function ComponentTooltip() {
  const [open, setOpen] = useState(false);
  const handleTooltipClose = () => {
    setOpen(false);
  };

  const handleTooltipOpen = () => {
    setOpen(true);
  };

  const longText = `
Aliquam eget finibus ante, non facilisis lectus. Sed vitae dignissim est, vel aliquam tellus.
Praesent non nunc mollis, fermentum neque at, semper arcu.
Nullam eget est sed sem iaculis gravida eget vitae justo.`;

  const simpleTooltipsCodeString = `<Tooltip title="Delete">
  <IconButton aria-label="delete" size="large">
    <Trash variant="Bold" />
  </IconButton>
</Tooltip>
<Tooltip title="Add" aria-label="add">
  <Fab color="primary" sx={{ m: 2 }}>
    <Add />
  </Fab>
</Tooltip>`;

  const customTooltipsCodeString = `<LightTooltip title="Light">
  <Button>Light</Button>
</LightTooltip>
<BootstrapTooltip title="Bootstrap">
  <Button>Bootstrap</Button>
</BootstrapTooltip>
<HtmlTooltip
  title={
    <>
      <Typography color="inherit">Tooltip with HTML</Typography>
      <em>And here&apos;s</em>{' '}
      <Typography variant="subtitle1" component="span">
        some
      </Typography>{' '}
      <u>amazing content</u>. it&apos;s very engaging. Right?
    </>
  }
>
  <Button>HTML</Button>
</HtmlTooltip>`;

  const arrowTooltipsCodeString = `<Tooltip title="Arrow" arrow>
  <Button>Arrow</Button>
</Tooltip>`;

  const delayTooltipsCodeString = `<Tooltip title="Delay Tooltip" enterDelay={500} leaveDelay={200}>
  <Button>[500ms, 200ms]</Button>
</Tooltip>`;

  const disabledTooltipsCodeString = `<Tooltip title="You don't have permission to do this">
  <span>
    <Button disabled>A Disabled Button</Button>
  </span>
</Tooltip>`;

  const interactiveTooltipsCodeString = `<Tooltip title="Disable Interactive" disableInteractive>
  <Button>Disable Interactive</Button>
</Tooltip>`;

  const controlledTooltipsCodeString = `<Tooltip disableFocusListener title="Hover or touch">
  <Button>Hover or touch</Button>
</Tooltip>
<Tooltip disableFocusListener disableTouchListener title="Hover">
  <Button>Hover</Button>
</Tooltip>
<ClickAwayListener onClickAway={handleTooltipClose}>
  <div>
    <Tooltip
      slotProps={{ popper: { disablePortal: true } }}
      onClose={handleTooltipClose}
      open={open}
      disableFocusListener
      disableHoverListener
      disableTouchListener
      title="Click"
    >
      <Button onClick={handleTooltipOpen}>Click</Button>
    </Tooltip>
  </div>
</ClickAwayListener>`;

  const transitionsTooltipsCodeString = `<Tooltip title="Grow">
  <Button>Grow</Button>
</Tooltip>
<Tooltip slots={{ transition: Fade }} slotProps={{ transition: { timeout: 600 } }} title="Fade">
  <Button>Fade</Button>
</Tooltip>
<Tooltip slots={{ transition: Zoom }} title="Zoom">
  <Button>Zoom</Button>
</Tooltip>`;

  const variableTooltipsCodeString = `<Tooltip title={longText}>
  <Button sx={{ m: 1 }}>Default Width [300px]</Button>
</Tooltip>
<CustomWidthTooltip title={longText}>
  <Button sx={{ m: 1 }}>Custom Width [500px]</Button>
</CustomWidthTooltip>
<NoMaxWidthTooltip title={longText}>
  <Button sx={{ m: 1 }}>No wrapping</Button>
</NoMaxWidthTooltip>`;

  const positionedTooltipsCodeString = `<Tooltip title="Top-Start" placement="top-start">
  <Button color="secondary" variant="outlined">
    top-start
  </Button>
</Tooltip>
<Tooltip title="Top" placement="top">
  <Button color="secondary" variant="outlined">
    top
  </Button>
</Tooltip>
<Tooltip title="Top-End" placement="top-end">
  <Button color="secondary" variant="outlined">
    top-end
  </Button>
</Tooltip>
<Tooltip title="Right-Start" placement="right-start">
  <Button color="secondary" variant="outlined">
    right-start
  </Button>
</Tooltip>
<Tooltip title="Right" placement="right">
  <Button color="secondary" variant="outlined">
    right
  </Button>
</Tooltip>
<Tooltip title="Right-End" placement="right-end">
  <Button color="secondary" variant="outlined">
    right-end
  </Button>
</Tooltip>
<Tooltip title="Left-Start" placement="left-start">
  <Button color="secondary" variant="outlined">
    left-start
  </Button>
</Tooltip>
<Tooltip title="Left" placement="left">
  <Button color="secondary" variant="outlined">
    left
  </Button>
</Tooltip>
<Tooltip title="Left-End" placement="left-end">
  <Button color="secondary" variant="outlined">
    left-end
  </Button>
</Tooltip>
<Tooltip title="Bottom-Start" placement="bottom-start">
  <Button color="secondary" variant="outlined">
    bottom-start
  </Button>
</Tooltip>
<Tooltip title="Bottom" placement="bottom">
  <Button color="secondary" variant="outlined">
    bottom
  </Button>
</Tooltip>
<Tooltip title="Bottom-End" placement="bottom-end">
  <Button color="secondary" variant="outlined">
    bottom-end
  </Button>
</Tooltip>`;
  const TooltipsVariantCodeString = `<CustomTooltip title="Primary" arrow color="primary">
  <Button color="primary" variant="outlined">
   primary
  </Button>
</CustomTooltip>
<CustomTooltip title="Secondary" arrow color="secondary">
  <Button color="secondary" variant="contained">
    Secondary
  </Button>
</CustomTooltip>
<CustomTooltip title="Success" arrow color="success">
  <Button color="success" variant="contained">
    Success
  </Button>
</CustomTooltip>
<CustomTooltip title="Info" arrow color="info">
  <Button color="info" variant="contained">
    Info
  </Button>
</CustomTooltip>
<CustomTooltip title="Warning" arrow color="warning">
  <Button color="warning" variant="contained">
    Warning
  </Button>
</CustomTooltip>
<CustomTooltip title="Error" arrow color="error">
  <Button color="error" variant="contained">
    Error
  </Button>
</CustomTooltip>
`;

  const TooltipsCustomColorCodeString = `<CustomTooltip title="Pink" arrow color="#fff" bg="pink">
  <Button color="inherit" variant="outlined">
    pink
  </Button>
</CustomTooltip>
<CustomTooltip title="Orange" arrow color="#fff">
  <Button color="inherit" variant="contained">
    Orange
  </Button>
</CustomTooltip>
<CustomTooltip title="Yellow" arrow color="#000">
  <Button color="inherit" variant="contained">
    Yellow
  </Button>
</CustomTooltip>
<CustomTooltip title="Black/White" arrow color="white" labelColor='#000'>
  <Button color="inherit" variant="contained">
    Black/White
  </Button>
</CustomTooltip>
`;

  return (
    <>
      <ComponentHeader
        title="Tooltip"
        caption="Tooltips display informative text when users hover over, focus on, or tap an element."
        directory="src/pages/components-overview/tooltip"
        link="https://mui.com/material-ui/react-tooltip/"
      />
      <ComponentWrapper>
        <Grid container spacing={GRID_COMMON_SPACING}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Stack sx={{ gap: GRID_COMMON_SPACING }}>
              <MainCard title="Simple Tooltips" codeHighlight codeString={simpleTooltipsCodeString}>
                <Grid container spacing={3} sx={{ alignItems: 'center' }}>
                  <Grid>
                    <Tooltip title="Delete">
                      <IconButton aria-label="delete" size="large" color="error">
                        <Trash variant="Bold" />
                      </IconButton>
                    </Tooltip>
                  </Grid>
                  <Grid>
                    <Tooltip title="Add" aria-label="add">
                      <Fab color="primary">
                        <Add />
                      </Fab>
                    </Tooltip>
                  </Grid>
                </Grid>
              </MainCard>
              <MainCard title="Customized Tooltip" codeString={customTooltipsCodeString}>
                <Grid container spacing={1} sx={{ alignItems: 'center' }}>
                  <Grid>
                    <LightTooltip title="Light">
                      <Button>Light</Button>
                    </LightTooltip>
                  </Grid>
                  <Grid>
                    <BootstrapTooltip title="Bootstrap">
                      <Button>Bootstrap</Button>
                    </BootstrapTooltip>
                  </Grid>
                  <Grid>
                    <HtmlTooltip
                      title={
                        <>
                          <Typography color="inherit">Tooltip with HTML</Typography>
                          <em>And here&apos;s</em>{' '}
                          <Typography variant="subtitle1" component="span">
                            some
                          </Typography>{' '}
                          <u>amazing content</u>. it&apos;s very engaging. Right?
                        </>
                      }
                    >
                      <Button>HTML</Button>
                    </HtmlTooltip>
                  </Grid>
                </Grid>
              </MainCard>
              <MainCard title="Arrow Tooltip" codeString={arrowTooltipsCodeString}>
                <Grid container spacing={1} sx={{ alignItems: 'center' }}>
                  <Grid>
                    <Tooltip title="Arrow" arrow>
                      <Button>Arrow</Button>
                    </Tooltip>
                  </Grid>
                </Grid>
              </MainCard>
              <MainCard title="Delay Tooltip" codeString={delayTooltipsCodeString}>
                <Grid container spacing={1} sx={{ alignItems: 'center' }}>
                  <Grid>
                    <Tooltip title="Delay Tooltip" enterDelay={500} leaveDelay={200}>
                      <Button>[500ms, 200ms]</Button>
                    </Tooltip>
                  </Grid>
                </Grid>
              </MainCard>
              <MainCard title="Disabled Tooltips" codeString={disabledTooltipsCodeString}>
                <Grid container spacing={1} sx={{ alignItems: 'center' }}>
                  <Grid>
                    <Tooltip title="You don't have permission to do this">
                      <span>
                        <Button disabled>A Disabled Button</Button>
                      </span>
                    </Tooltip>
                  </Grid>
                </Grid>
              </MainCard>
              <MainCard title="Disable Interactive Tooltips" codeString={interactiveTooltipsCodeString}>
                <Grid container spacing={1} sx={{ alignItems: 'center' }}>
                  <Grid>
                    <Tooltip title="Disable Interactive" disableInteractive>
                      <Button>Disable Interactive</Button>
                    </Tooltip>
                  </Grid>
                </Grid>
              </MainCard>
            </Stack>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Stack sx={{ gap: GRID_COMMON_SPACING }}>
              <MainCard title="Triggers/Controlled Tooltips" codeString={controlledTooltipsCodeString}>
                <Grid container spacing={1} sx={{ alignItems: 'center' }}>
                  <Grid>
                    <Tooltip disableFocusListener title="Hover or touch">
                      <Button>Hover or touch</Button>
                    </Tooltip>
                  </Grid>
                  <Grid>
                    <Tooltip disableFocusListener disableTouchListener title="Hover">
                      <Button>Hover</Button>
                    </Tooltip>
                  </Grid>
                  <Grid>
                    <ClickAwayListener onClickAway={handleTooltipClose}>
                      <div>
                        <Tooltip
                          onClose={handleTooltipClose}
                          open={open}
                          disableFocusListener
                          disableHoverListener
                          disableTouchListener
                          title="Click"
                          slotProps={{ popper: { disablePortal: true } }}
                        >
                          <Button onClick={handleTooltipOpen}>Click</Button>
                        </Tooltip>
                      </div>
                    </ClickAwayListener>
                  </Grid>
                </Grid>
              </MainCard>
              <MainCard title="Transitions Tooltips" codeString={transitionsTooltipsCodeString}>
                <Grid container spacing={1} sx={{ alignItems: 'center' }}>
                  <Grid>
                    <Tooltip title="Grow">
                      <Button>Grow</Button>
                    </Tooltip>
                  </Grid>
                  <Grid>
                    <Tooltip title="Fade" slots={{ transition: Fade }} slotProps={{ transition: { timeout: 600 } }}>
                      <Button>Fade</Button>
                    </Tooltip>
                  </Grid>
                  <Grid>
                    <Tooltip title="Zoom" slots={{ transition: Zoom }}>
                      <Button>Zoom</Button>
                    </Tooltip>
                  </Grid>
                </Grid>
              </MainCard>
              <MainCard title="Variable Width Tooltips" codeString={variableTooltipsCodeString}>
                <Grid container spacing={1} sx={{ alignItems: 'center' }}>
                  <Grid>
                    <Tooltip title={longText}>
                      <Button sx={{ m: 1 }}>Default Width [300px]</Button>
                    </Tooltip>
                  </Grid>
                  <Grid>
                    <CustomWidthTooltip title={longText}>
                      <Button sx={{ m: 1 }}>Custom Width [500px]</Button>
                    </CustomWidthTooltip>
                  </Grid>
                  <Grid>
                    <NoMaxWidthTooltip title={longText}>
                      <Button sx={{ m: 1 }}>No wrapping</Button>
                    </NoMaxWidthTooltip>
                  </Grid>
                </Grid>
              </MainCard>
              <MainCard title="Positioned Tooltips" codeString={positionedTooltipsCodeString}>
                <>
                  <Grid container spacing={1} sx={{ justifyContent: 'center' }}>
                    <Grid>
                      <Tooltip title="Top-Start" placement="top-start">
                        <Button color="secondary" variant="outlined">
                          top-start
                        </Button>
                      </Tooltip>
                    </Grid>
                    <Grid>
                      <Tooltip title="Top" placement="top">
                        <Button color="secondary" variant="outlined">
                          top
                        </Button>
                      </Tooltip>
                    </Grid>
                    <Grid>
                      <Tooltip title="Top-End" placement="top-end">
                        <Button color="secondary" variant="outlined">
                          top-end
                        </Button>
                      </Tooltip>
                    </Grid>
                  </Grid>
                  <Grid container sx={{ justifyContent: 'center', my: 1 }}>
                    <Grid container direction="column" spacing={1} size={6} sx={{ alignItems: 'flex-start' }}>
                      <Grid>
                        <Tooltip title="Right-Start" placement="right-start">
                          <Button color="secondary" variant="outlined">
                            right-start
                          </Button>
                        </Tooltip>
                      </Grid>
                      <Grid>
                        <Tooltip title="Right" placement="right">
                          <Button color="secondary" variant="outlined">
                            right
                          </Button>
                        </Tooltip>
                      </Grid>
                      <Grid>
                        <Tooltip title="Right-End" placement="right-end">
                          <Button color="secondary" variant="outlined">
                            right-end
                          </Button>
                        </Tooltip>
                      </Grid>
                    </Grid>
                    <Grid container direction="column" spacing={1} size={6} sx={{ alignItems: 'flex-end' }}>
                      <Grid>
                        <Tooltip title="Left-Start" placement="left-start">
                          <Button color="secondary" variant="outlined">
                            left-start
                          </Button>
                        </Tooltip>
                      </Grid>
                      <Grid>
                        <Tooltip title="Left" placement="left">
                          <Button color="secondary" variant="outlined">
                            left
                          </Button>
                        </Tooltip>
                      </Grid>
                      <Grid>
                        <Tooltip title="Left-End" placement="left-end">
                          <Button color="secondary" variant="outlined">
                            left-end
                          </Button>
                        </Tooltip>
                      </Grid>
                    </Grid>
                  </Grid>
                  <Grid container spacing={1} sx={{ justifyContent: 'center' }}>
                    <Grid>
                      <Tooltip title="Bottom-Start" placement="bottom-start">
                        <Button color="secondary" variant="outlined">
                          bottom-start
                        </Button>
                      </Tooltip>
                    </Grid>
                    <Grid>
                      <Tooltip title="Bottom" placement="bottom">
                        <Button color="secondary" variant="outlined">
                          bottom
                        </Button>
                      </Tooltip>
                    </Grid>
                    <Grid>
                      <Tooltip title="Bottom-End" placement="bottom-end">
                        <Button color="secondary" variant="outlined">
                          bottom-end
                        </Button>
                      </Tooltip>
                    </Grid>
                  </Grid>
                </>
              </MainCard>
              <MainCard title="Color Variant Tooltips" codeString={TooltipsVariantCodeString}>
                <Grid container spacing={1} sx={{ alignItems: 'center' }}>
                  <Grid>
                    <CustomTooltip title="Primary" arrow color="primary">
                      <Button color="primary" variant="contained">
                        Primary
                      </Button>
                    </CustomTooltip>
                  </Grid>
                  <Grid>
                    <CustomTooltip
                      title="Secondary"
                      arrow
                      color="secondary"
                      sx={(theme) => ({
                        ...(theme.palette.mode === 'dark' && { '.MuiTooltip-tooltip': { color: theme.palette.common.black } })
                      })}
                    >
                      <Button color="secondary" variant="contained">
                        Secondary
                      </Button>
                    </CustomTooltip>
                  </Grid>
                  <Grid>
                    <CustomTooltip title="Success" arrow color="success">
                      <Button color="success" variant="contained">
                        Success
                      </Button>
                    </CustomTooltip>
                  </Grid>
                  <Grid>
                    <CustomTooltip title="Info" arrow color="info">
                      <Button color="info" variant="contained">
                        Info
                      </Button>
                    </CustomTooltip>
                  </Grid>
                  <Grid>
                    <CustomTooltip title="Warning" arrow color="warning">
                      <Button color="warning" variant="contained">
                        Warning
                      </Button>
                    </CustomTooltip>
                  </Grid>
                  <Grid>
                    <CustomTooltip title="Error" arrow color="error">
                      <Button color="error" variant="contained">
                        error
                      </Button>
                    </CustomTooltip>
                  </Grid>
                </Grid>
              </MainCard>
              <MainCard title="Custom Color Tooltips" codeString={TooltipsCustomColorCodeString}>
                <Grid container spacing={1} sx={{ alignItems: 'center' }}>
                  <Grid>
                    <CustomTooltip title="Pink" arrow color="pink" labelColor="#000">
                      <Button color="inherit" variant="outlined">
                        pink
                      </Button>
                    </CustomTooltip>
                  </Grid>
                  <Grid>
                    <CustomTooltip title="Orange" arrow color="orange">
                      <Button color="inherit" variant="outlined">
                        Orange
                      </Button>
                    </CustomTooltip>
                  </Grid>
                  <Grid>
                    <CustomTooltip title="Yellow" arrow color="yellow" labelColor="#000">
                      <Button color="inherit" variant="outlined">
                        Yellow
                      </Button>
                    </CustomTooltip>
                  </Grid>
                  <Grid>
                    <CustomTooltip title="Black/white" arrow color="#fff" labelColor="#000">
                      <Button color="inherit" variant="outlined">
                        Black/white
                      </Button>
                    </CustomTooltip>
                  </Grid>
                </Grid>
              </MainCard>
            </Stack>
          </Grid>
        </Grid>
      </ComponentWrapper>
    </>
  );
}
