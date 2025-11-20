'use client';

import { MouseEvent, useState } from 'react';

// material-ui
import Stack from '@mui/material/Stack';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Typography from '@mui/material/Typography';

// project-imports
import TicketDetailsDrawer from './TicketDetailsDrawer';
import TicketCommonCard from 'components/cards/helpdesk/TicketCommonCard';
import MainCard from 'components/MainCard';
import { GRID_COMMON_SPACING } from 'config';
import { ticketData } from 'data/helpdesk';

// assets
import { Element3, HambergerMenu, TextalignJustifycenter } from '@wandersonalwes/iconsax-react';

// ==============================|| HELPDESK - TICKET LIST CARD ||============================== //

export default function TicketListCard() {
  const [alignment, setAlignment] = useState<number | null>(1);
  const [showBox, setShowBox] = useState(true);
  const [showAvatarStack, setShowAvatarStack] = useState(true);

  const [openDrawer, setOpenDrawer] = useState<boolean>(false);
  const handleDrawerOpen = () => {
    setOpenDrawer((prevState) => !prevState);
  };

  const handleAlignment = (event: MouseEvent<HTMLElement>, newAlignment: number | null) => {
    setAlignment(newAlignment);

    if (newAlignment === 1) {
      setShowBox(true);
      setShowAvatarStack(true);
    } else if (newAlignment === 2) {
      setShowBox(false);
      setShowAvatarStack(false);
    } else if (newAlignment === 3) {
      setShowBox(false);
      setShowAvatarStack(true);
    }
  };

  return (
    <Stack sx={{ gap: GRID_COMMON_SPACING }}>
      <MainCard>
        <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h5">Ticket List</Typography>
          <ToggleButtonGroup
            value={alignment}
            sx={{ '& .MuiToggleButton-root': { p: 0.625 } }}
            exclusive
            onChange={handleAlignment}
            aria-label="view mode"
          >
            <ToggleButton value={2} aria-label="small list view">
              <TextalignJustifycenter />
            </ToggleButton>
            <ToggleButton value={3} aria-label="medium list view">
              <HambergerMenu />
            </ToggleButton>
            <ToggleButton value={1} aria-label="details view">
              <Element3 />
            </ToggleButton>
          </ToggleButtonGroup>
        </Stack>
      </MainCard>
      {ticketData.map((ticket, index) => (
        <TicketCommonCard
          key={index}
          drawerOpen={handleDrawerOpen}
          chipLabel={ticket.chipLabel}
          customerName={ticket.customerName}
          ticketCount={ticket.ticketCount}
          issueTitle={ticket.issueTitle}
          likes={ticket.likes}
          addCode={ticket.addCode}
          removeCode={ticket.removeCode}
          customerAvatar={ticket.customerAvatar}
          productAvatar={ticket.productAvatar}
          productName={ticket.productName}
          supporterAvatar={ticket.supporterAvatar}
          supporterName={ticket.supporterName}
          updateTime={ticket.updateTime}
          messageCount={ticket.messageCount}
          showBox={showBox}
          showAvatarStack={showAvatarStack}
          borderLeft={ticket.borderLeft}
          borderColor={ticket.borderColor}
        />
      ))}
      <TicketDetailsDrawer isOpen={openDrawer} handleDrawerOpen={handleDrawerOpen} />
    </Stack>
  );
}
