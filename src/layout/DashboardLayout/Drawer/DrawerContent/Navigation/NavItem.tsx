import { useEffect } from 'react';

// next
import Link from 'next/link';
import { usePathname } from 'next/navigation';

// material-ui
import useMediaQuery from '@mui/material/useMediaQuery';
import Avatar from '@mui/material/Avatar';
import Chip from '@mui/material/Chip';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

// project-imports
import Dot from 'components/@extended/Dot';
import IconButton from 'components/@extended/IconButton';

// third-party
import { FormattedMessage } from 'react-intl';

import { handlerHorizontalActiveItem, handlerActiveItem, handlerDrawerOpen, useGetMenuMaster } from 'api/menu';
import { MenuOrientation, NavActionType } from 'config';
import useConfig from 'hooks/useConfig';
import { catalogueApi } from 'app/api/services/CatalogueService';
import { openSnackbar } from 'api/snackbar';

// types
import { LinkTarget, NavItemType } from 'types/menu';

// ==============================|| NAVIGATION - ITEM ||============================== //

interface Props {
  item: NavItemType;
  level: number;
  isParents?: boolean;
  setSelectedID?: () => void;
  // When true, this item is rendered inside a sidebar dropdown (header menu).
  isSidebarDropdownMenu?: boolean;
}

export default function NavItem({ item, level, isParents = false, setSelectedID, isSidebarDropdownMenu = false }: Props) {
  const downLG = useMediaQuery((theme) => theme.breakpoints.down('lg'));

  const { menuMaster } = useGetMenuMaster();
  const drawerOpen = menuMaster.isDashboardDrawerOpened;
  const openItem = menuMaster.openedItem;

  const { menuOrientation } = useConfig();
  let itemTarget: LinkTarget = '_self';
  if (item.target) {
    itemTarget = '_blank';
  }

  const Icon = item.icon!;
  const itemIcon = item.icon ? (
    <Icon
      variant="Bulk"
      size={drawerOpen ? 20 : 22}
      style={{ ...(menuOrientation === MenuOrientation.HORIZONTAL && isParents && { fontSize: 20, stroke: '1.5' }) }}
    />
  ) : (
    false
  );

  const isSelected = openItem === item.id;
  const pathname = usePathname();

  // active menu item on page load
  useEffect(() => {
    if (pathname === item.url) handlerActiveItem(item.id!);
    // eslint-disable-next-line
  }, [pathname]);

  const iconSelectedColor = '#3B82F6';
  // Sidebar submenu (dropdown) text color
  const dropdownColor = '#94A3B8';
  const baseTextColor = isSidebarDropdownMenu ? dropdownColor : '#F8FAFC';
  const baseDarkTextColor = isSidebarDropdownMenu ? dropdownColor : '#94A3B8';
  const itemHandler = () => {
    if (downLG) handlerDrawerOpen(false);

    if (isParents && setSelectedID) {
      setSelectedID();
    }
  };

  const handleCatalogueLogin = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (downLG) handlerDrawerOpen(false);

    try {
      const newWindow = window.open('', '_blank');
      if (newWindow) {
        newWindow.document.write('<html><body style="background: #111; color: #eee; display: flex; align-items: center; justify-content: center; height: 100vh; font-family: sans-serif;"><div>Connexion au catalogue en cours...</div></body></html>');
      }

      const data = await catalogueApi.login();
      
      if (newWindow) {
        newWindow.location.href = data.redirectUrl;
      } else {
        // Fallback if window.open was somehow null
        window.open(data.redirectUrl, '_blank');
      }
      
      openSnackbar({
        open: true,
        message: `Catalogue ouvert!`,
        variant: 'alert',
        alert: { color: 'success', variant: 'filled' },
        close: true
      });
    } catch (err: any) {
      if (newWindow) newWindow.close();
      openSnackbar({
        open: true,
        message: err.message || 'Erreur de connexion au catalogue',
        variant: 'alert',
        alert: { color: 'error', variant: 'filled' },
        close: true
      });
    }
  };

  return (
    <>
      {menuOrientation === MenuOrientation.VERTICAL || downLG ? (
        <Box sx={{ position: 'relative' }}>
          <ListItemButton
            {...(item.id === 'connexion-catalogue' ? { component: 'div' } : { component: Link, href: item.url!, target: itemTarget })}
            disabled={item.disabled}
            selected={isSelected}
            sx={(theme) => ({
              zIndex: 1201,
              pl: level === 2 ? 3.25 : drawerOpen ? (level <= 3 ? (level * 20) / 8 : (level * 20 + (level - 3) * 10) / 8) : 1.5,
              py: !drawerOpen && level === 1 ? 1.25 : 1,
              ...(drawerOpen && {
                '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.04)', ...theme.applyStyles('dark', { bgcolor: 'divider' }) },
                '&.Mui-selected': {
                  '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.12)', ...theme.applyStyles('dark', { bgcolor: 'primary.800' }) },
                  bgcolor: 'rgba(255, 255, 255, 0.08)',
                  ...theme.applyStyles('dark', { bgcolor: 'primary.800' })
                }
              }),
              ...(drawerOpen &&
                level === 1 && {
                mx: 1.25,
                my: 0.5,
                borderRadius: 1,
                '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.04)', ...theme.applyStyles('dark', { bgcolor: 'divider' }) }
              }),
              ...(!drawerOpen && {
                px: 2.75,
                justifyContent: 'center',
                '&:hover': { bgcolor: 'transparent' },
                '&.Mui-selected': {
                  '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.12)', ...theme.applyStyles('dark', { bgcolor: 'primary.800' }) },
                  bgcolor: 'rgba(255, 255, 255, 0.08)',
                  ...theme.applyStyles('dark', { bgcolor: 'primary.800' })
                }
              })
            })}
            onClick={(e) => {
              if (item.id === 'connexion-catalogue' || item.id?.toLowerCase().includes('catalogue')) {
                handleCatalogueLogin(e);
              } else {
                itemHandler();
              }
            }}
          >
            {itemIcon && (
              <ListItemIcon
                sx={(theme) => ({
                  minWidth: 38,
                  color: baseTextColor,
                  ...theme.applyStyles('dark', { color: baseDarkTextColor }),
                  ...(isSelected && { color: iconSelectedColor }),
                  ...(!drawerOpen &&
                    level === 1 && {
                    borderRadius: 1,
                    width: 46,
                    height: 46,
                    alignItems: 'center',
                    justifyContent: 'center',
                    '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.04)', ...theme.applyStyles('dark', { bgcolor: 'divider' }) }
                  }),
                  ...(!drawerOpen &&
                    isSelected && {
                    bgcolor: 'rgba(255, 255, 255, 0.08)',
                    '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.12)' },
                    ...theme.applyStyles('dark', { bgcolor: 'divider', '&:hover': { bgcolor: 'divider' } })
                  })
                })}
              >
                {itemIcon}
              </ListItemIcon>
            )}

            {!itemIcon && drawerOpen && (
              <ListItemIcon
                sx={{
                  minWidth: 30
                }}
              >
                <Dot size={isSelected ? 6 : 5} color={isSelected ? 'primary' : isSidebarDropdownMenu ? 'secondary' : 'secondary'} />
              </ListItemIcon>
            )}

            {(drawerOpen || (!drawerOpen && level !== 1)) && (
              <ListItemText
                primary={
                  <Typography
                    variant="h6"
                    sx={(theme) => ({
                      color: baseTextColor,
                      ...theme.applyStyles('dark', { color: baseDarkTextColor }),
                      ...(isSelected && { color: iconSelectedColor }),
                      fontWeight: isSelected ? 500 : 400
                    })}
                  >
                    <FormattedMessage id={item.title} />
                  </Typography>
                }
              />
            )}
            {(drawerOpen || (!drawerOpen && level !== 1)) && item.chip && (
              <Chip
                color={item.chip.color}
                variant={item.chip.variant}
                size={item.chip.size}
                label={<FormattedMessage id={item.chip.label as string} />}
                avatar={item.chip.avatar && <Avatar>{item.chip.avatar}</Avatar>}
              />
            )}
          </ListItemButton>

          {(drawerOpen || (!drawerOpen && level !== 1)) &&
            item?.actions &&
            item.actions.map((action, index) => {
              const ActionIcon = action?.icon || null;
              const callAction = action?.function;

              return ActionIcon ? (
                <IconButton
                  key={index}
                  {...(action.type === NavActionType.FUNCTION && {
                    onClick: (event) => {
                      event.stopPropagation();
                      callAction?.();
                    }
                  })}
                  {...(action.type === NavActionType.LINK && {
                    component: Link,
                    href: action.url,
                    target: action.target ? '_blank' : '_self'
                  })}
                  color={isSelected ? 'primary' : 'secondary'}
                  variant="outlined"
                  sx={(theme) => ({
                    position: 'absolute',
                    top: 12,
                    right: 10,
                    zIndex: 1202,
                    width: 20,
                    height: 20,
                    p: 0.25,
                    borderColor: isSelected ? 'primary.light' : 'secondary.light',
                    '&:hover': { borderColor: isSelected ? 'primary.main' : 'secondary.main' },
                    ...theme.applyStyles('dark', { color: isSelected ? 'primary.main' : baseDarkTextColor })
                  })}
                >
                  <ActionIcon size={12} style={{ marginLeft: 1 }} />
                </IconButton>
              ) : null;
            })}
        </Box>
      ) : (
        <ListItemButton
          {...(item.id === 'connexion-catalogue' ? { component: 'div' } : { component: Link, href: item.url!, target: itemTarget })}
          disabled={item.disabled}
          selected={isSelected}
          disableTouchRipple
          sx={(theme) => ({
            zIndex: 1201,
            borderRadius: !isParents && level >= 1 ? 0 : 1,
            height: 46,
            ...(isParents && { color: baseTextColor, ...theme.applyStyles('dark', { color: baseDarkTextColor }), p: 1, mr: 1 }),
            ...(!isParents && {
              '&.Mui-selected': {
                bgcolor: 'rgba(255, 255, 255, 0.08)',
                ...theme.applyStyles('dark', { bgcolor: 'primary.800' }),
                color: iconSelectedColor,
                '&:hover': {
                  color: iconSelectedColor,
                  bgcolor: 'rgba(255, 255, 255, 0.12)',
                  ...theme.applyStyles('dark', { bgcolor: 'primary.800' })
                }
              }
            })
          })}
          onClick={(e) => {
            if (item.id === 'connexion-catalogue' || item.id?.toLowerCase().includes('catalogue')) {
              handleCatalogueLogin(e);
            } else {
              if (isParents) {
                handlerHorizontalActiveItem(item.id!);
              }
              itemHandler();
            }
          }}
        >
          {itemIcon && (
            <ListItemIcon
              sx={{
                minWidth: 36,
                ...(!drawerOpen && {
                  borderRadius: 1,
                  width: 36,
                  height: 36,
                  alignItems: 'center',
                  justifyContent: 'flex-start',
                  '&:hover': { bgcolor: 'transparent' }
                }),
                ...(!drawerOpen && isSelected && { bgcolor: 'transparent', '&:hover': { bgcolor: 'transparent' } })
              }}
            >
              {itemIcon}
            </ListItemIcon>
          )}

          <ListItemText
            primary={
              <Typography
                variant="h6"
                sx={(theme) => ({
                  color: baseTextColor,
                  ...theme.applyStyles('dark', { color: baseDarkTextColor }),
                  ...(isSelected && { color: iconSelectedColor }),
                  fontWeight: isSelected ? 500 : 400
                })}
              >
                <FormattedMessage id={item.title} />
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
              sx={{ ml: 1 }}
            />
          )}
        </ListItemButton>
      )}
    </>
  );
}
