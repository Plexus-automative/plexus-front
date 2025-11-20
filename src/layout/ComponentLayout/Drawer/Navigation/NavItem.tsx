'use client';

import { useEffect } from 'react';

// next
import Link from 'next/link';

// material-ui
import useMediaQuery from '@mui/material/useMediaQuery';
import Avatar from '@mui/material/Avatar';
import Chip from '@mui/material/Chip';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';

// project-imports
import { handlerActiveComponent, handlerComponentDrawer, useGetMenuMaster } from 'api/menu';

// third-party
import { FormattedMessage } from 'react-intl';

// types
import { LinkTarget, NavItemType } from 'types/menu';

// ==============================|| NAVIGATION - LIST ITEM ||============================== //

interface Props {
  item: NavItemType;
}

export default function NavItem({ item }: Props) {
  const { menuMaster } = useGetMenuMaster();
  const openComponent = menuMaster.openedComponent;
  const downMD = useMediaQuery((theme) => theme.breakpoints.down('md'));

  let itemTarget: LinkTarget = '_self';
  if (item.target) {
    itemTarget = '_blank';
  }

  const itemHandler = (id: string) => {
    handlerActiveComponent(id);
    if (downMD) handlerComponentDrawer(false);
  };

  // active menu item on page load
  useEffect(() => {
    const currentIndex = document.location.pathname
      .toString()
      .split('/')
      .findIndex((id) => id === item.id);
    if (currentIndex > -1) {
      handlerActiveComponent(item.id!);
    }
    // eslint-disable-next-line
  }, []);

  const isSelectedItem = openComponent === item.id;

  return (
    <ListItemButton
      component={Link}
      href={item.url!}
      target={itemTarget}
      disabled={item.disabled}
      onClick={() => itemHandler(item.id!)}
      selected={isSelectedItem}
      sx={{ pl: 2.5, py: 1, mb: 0.5 }}
    >
      <ListItemText
        primary={
          <Typography
            variant="h6"
            sx={(theme) => ({
              color: isSelectedItem ? 'primary.main' : 'secondary.main',
              ...theme.applyStyles('dark', { color: isSelectedItem ? 'text.primary' : 'secondary.400' })
            })}
          >
            <FormattedMessage id={item.title as string} />
          </Typography>
        }
      />
      {item.chip && (
        <Chip
          color={item.chip.color}
          variant={item.chip.variant}
          size={item.chip.size}
          label={item.chip.label}
          avatar={item.chip.avatar && <Avatar>{item.chip.avatar}</Avatar>}
        />
      )}
    </ListItemButton>
  );
}
