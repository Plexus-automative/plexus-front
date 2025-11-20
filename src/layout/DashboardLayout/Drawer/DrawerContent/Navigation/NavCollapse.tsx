import { useEffect, useState, useMemo, Dispatch, MouseEvent, SetStateAction } from 'react';

// next
import { usePathname, useRouter } from 'next/navigation';

// material-ui
import { styled, useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import Collapse from '@mui/material/Collapse';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Menu from '@mui/material/Menu';
import Paper from '@mui/material/Paper';
import Popper from '@mui/material/Popper';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

// project-imports
import NavItem from './NavItem';
import Dot from 'components/@extended/Dot';
import IconButton from 'components/@extended/IconButton';
import Transitions from 'components/@extended/Transitions';
import SimpleBar from 'components/third-party/SimpleBar';

import { handlerActiveItem, useGetMenuMaster } from 'api/menu';
import { MenuOrientation } from 'config';
import useConfig from 'hooks/useConfig';
import useMenuCollapse from 'hooks/useMenuCollapse';

// third-party
import { FormattedMessage } from 'react-intl';

// assets
import { ArrowDown2, ArrowUp2, ArrowRight2, Copy } from '@wandersonalwes/iconsax-react';

// types
import { NavItemType } from 'types/menu';

type ListItemClick =
  | React.MouseEvent<HTMLButtonElement>
  | React.MouseEvent<HTMLAnchorElement>
  | React.MouseEvent<HTMLDivElement, MouseEvent>
  | undefined;

type VirtualElement = {
  getBoundingClientRect: () => DOMRect;
  contextElement?: Element;
};

// mini-menu - wrapper
const PopperStyled = styled(Popper)(({ theme }) => ({
  overflow: 'visible',
  zIndex: 1202,
  minWidth: 180,
  '&:before': {
    content: '""',
    display: 'block',
    position: 'absolute',
    top: 38,
    left: -5,
    width: 10,
    height: 10,
    backgroundColor: theme.palette.background.paper,
    transform: 'translateY(-50%) rotate(45deg)',
    zIndex: 120,
    borderLeft: `1px solid ${theme.palette.divider}`,
    borderBottom: `1px solid ${theme.palette.divider}`
  }
}));

// ==============================|| NAVIGATION - COLLAPSE ||============================== //

interface Props {
  menu: NavItemType;
  level: number;
  parentId: string;
  setSelectedItems: Dispatch<SetStateAction<string | undefined>>;
  selectedItems: string | undefined;
  setSelectedLevel: Dispatch<SetStateAction<number>>;
  selectedLevel: number;
}

export default function NavCollapse({ menu, level, parentId, setSelectedItems, selectedItems, setSelectedLevel, selectedLevel }: Props) {
  const theme = useTheme();
  const { menuMaster } = useGetMenuMaster();
  const drawerOpen = menuMaster.isDashboardDrawerOpened;

  const downLG = useMediaQuery((theme) => theme.breakpoints.down('lg'));

  const { menuOrientation } = useConfig();
  const router = useRouter();

  const [open, setOpen] = useState<boolean>(false);
  const [selected, setSelected] = useState<string | null | undefined>(null);
  const [anchorEl, setAnchorEl] = useState<VirtualElement | (() => VirtualElement) | null | undefined>(null);

  const [anchorElCollapse, setAnchorElCollapse] = useState<null | HTMLElement>(null);

  const openCollapse = Boolean(anchorElCollapse);
  const handleClickCollapse = (event: React.MouseEvent<HTMLAnchorElement> | React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    setAnchorElCollapse(event.currentTarget);
  };
  const handleCloseCollapse = () => {
    setAnchorElCollapse(null);
  };

  const handleClick = (event: ListItemClick, isRedirect: boolean) => {
    setAnchorEl(null);
    setSelectedLevel(level);
    if (drawerOpen) {
      setOpen(!open);
      setSelected(!selected ? menu.id : null);
      setSelectedItems(!selected ? menu.id : '');
      if (menu.url && isRedirect) router.push(`${menu.url}`);
    } else {
      setAnchorEl(event?.currentTarget);
    }
  };

  const handlerIconLink = () => {
    if (!drawerOpen) {
      if (menu.url) router.push(`${menu.url}`);
      if (menuOrientation === MenuOrientation.VERTICAL) setSelected(menu.id);
    }
  };

  const handleHover = (event: MouseEvent<HTMLElement> | undefined) => {
    setAnchorEl(event?.currentTarget);
  };

  const miniMenuOpened = Boolean(anchorEl);

  const handleMiniClose = () => {
    setAnchorEl(null);
  };

  const handleClose = () => {
    setOpen(false);
    if (!miniMenuOpened && !menu.url) {
      setSelected(null);
    }
    setAnchorEl(null);
  };

  useMemo(() => {
    if (selected === selectedItems) {
      if (level === 1) {
        setOpen(true);
      }
    } else {
      if (level === selectedLevel) {
        setOpen(false);
        if ((!miniMenuOpened && !drawerOpen && !selected) || drawerOpen) {
          setSelected(null);
        }
      }
    }
  }, [selectedItems, level, selected, miniMenuOpened, drawerOpen, selectedLevel]);

  const pathname = usePathname();

  // menu collapse for sub-levels
  useMenuCollapse(menu, pathname, miniMenuOpened, setSelected, setOpen, setAnchorEl);

  useEffect(() => {
    if (menu.url === pathname) {
      handlerActiveItem(menu.id!);
      setSelected(menu.id);
      setAnchorEl(null);
      setOpen(true);
    }
  }, [pathname, menu]);

  const navCollapse = menu.children?.map((item) => {
    switch (item.type) {
      case 'collapse':
        return (
          <NavCollapse
            key={item.id}
            setSelectedItems={setSelectedItems}
            setSelectedLevel={setSelectedLevel}
            selectedLevel={selectedLevel}
            selectedItems={selectedItems}
            menu={item}
            level={level + 1}
            parentId={parentId}
          />
        );
      case 'item':
        return <NavItem key={item.id} item={item} level={level + 1} />;
      default:
        return (
          <Typography key={item.id} variant="h6" color="error" align="center">
            Fix - Collapse or Item
          </Typography>
        );
    }
  });

  const isSelected = selected === menu.id;
  const borderIcon = level === 1 ? <Copy variant="Bulk" size={drawerOpen ? 22 : 24} /> : false;
  const Icon = menu.icon!;
  const menuIcon = menu.icon ? <Icon variant="Bulk" size={drawerOpen ? 22 : 24} /> : borderIcon;
  const popperId = miniMenuOpened ? `collapse-pop-${menu.id}` : undefined;
  const FlexBox = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' };

  const selectedTextColor = isSelected || anchorEl ? 'primary.main' : null;
  const lightTextColor = selectedTextColor || 'secondary.main';
  const darkTextColor = selectedTextColor || 'secondary.400';

  const arrowStyle = { size: 12, style: { marginLeft: 1 } };

  return (
    <>
      {menuOrientation === MenuOrientation.VERTICAL || downLG ? (
        <>
          <ListItemButton
            id={`${menu.id}-button`}
            selected={isSelected}
            {...(!drawerOpen && { onMouseEnter: (e) => handleClick(e, true), onMouseLeave: handleMiniClose })}
            onClick={(e) => handleClick(e, true)}
            sx={(theme) => ({
              pl: level === 2 ? 3.25 : drawerOpen ? (level <= 3 ? (level * 20) / 8 : (level * 20 + (level - 3) * 10) / 8) : 1.5,
              py: !drawerOpen && level === 1 ? 1.25 : 1,
              ...(drawerOpen &&
                level === 1 && {
                  mx: 1.25,
                  my: 0.5,
                  borderRadius: 1,
                  '&:hover': { bgcolor: 'secondary.200', ...theme.applyStyles('dark', { bgcolor: 'divider' }) }
                }),
              ...(!drawerOpen && {
                px: 2.75,
                '&:hover': { bgcolor: 'transparent' },
                '&.Mui-selected': {
                  '&:hover': { bgcolor: 'transparent' },
                  bgcolor: 'transparent'
                }
              })
            })}
            {...((drawerOpen &&
              menu.isDropdown && {
                'aria-controls': openCollapse ? `${menu.id}-menu` : undefined,
                'aria-haspopup': true,
                'aria-expanded': openCollapse ? 'true' : undefined,
                onClick: handleClickCollapse
              }) as any)}
          >
            {menuIcon && (
              <ListItemIcon
                onClick={handlerIconLink}
                sx={(theme) => ({
                  minWidth: 38,
                  color: lightTextColor,
                  ...theme.applyStyles('dark', { color: darkTextColor }),
                  ...(!drawerOpen && {
                    borderRadius: 1,
                    width: 46,
                    height: 46,
                    alignItems: 'center',
                    justifyContent: 'center',
                    '&:hover': { bgcolor: 'secondary.200', ...theme.applyStyles('dark', { bgcolor: 'divider' }) },
                    ...((isSelected || anchorEl) && {
                      bgcolor: 'primary.lighter',
                      '&:hover': { bgcolor: 'primary.lighter' },
                      ...theme.applyStyles('dark', { bgcolor: 'divider', '&:hover': { bgcolor: 'divider' } })
                    })
                  })
                })}
              >
                {menuIcon}
              </ListItemIcon>
            )}

            {!menuIcon && drawerOpen && (
              <ListItemIcon sx={{ minWidth: 30 }}>
                <Dot size={isSelected || anchorEl ? 6 : 5} color={isSelected || anchorEl ? 'primary' : 'secondary'} />
              </ListItemIcon>
            )}

            {(drawerOpen || (!drawerOpen && level !== 1)) && (
              <ListItemText
                primary={
                  <Typography
                    variant="h6"
                    sx={(theme) => ({
                      fontWeight: isSelected || anchorEl ? 500 : 400,
                      color: lightTextColor,
                      ...theme.applyStyles('dark', { color: darkTextColor })
                    })}
                  >
                    <FormattedMessage id={menu.title} />
                  </Typography>
                }
                secondary={
                  menu.caption && (
                    <Typography variant="caption" color="secondary">
                      <FormattedMessage id={menu.caption} />
                    </Typography>
                  )
                }
              />
            )}
            {(drawerOpen || (!drawerOpen && level !== 1)) &&
              (menu?.url ? (
                <IconButton
                  onClick={(event) => {
                    event.stopPropagation();
                    handleClick(event, false);
                  }}
                  color="secondary"
                  variant="outlined"
                  sx={(theme) => ({
                    width: 20,
                    height: 20,
                    mr: '-5px !important',
                    p: 0.25,
                    borderColor: open ? 'primary.light' : 'secondary.light',
                    '&:hover': { borderColor: open ? 'primary.main' : 'secondary.main' },
                    color: lightTextColor,
                    ...theme.applyStyles('dark', { color: darkTextColor })
                  })}
                >
                  {miniMenuOpened || open ? (
                    <>{miniMenuOpened ? <ArrowRight2 {...arrowStyle} /> : <ArrowUp2 {...arrowStyle} />}</>
                  ) : (
                    <ArrowDown2 {...arrowStyle} />
                  )}
                </IconButton>
              ) : (
                <Box component="span" sx={(theme) => ({ color: lightTextColor, ...theme.applyStyles('dark', { color: darkTextColor }) })}>
                  {miniMenuOpened || open ? (
                    <>{miniMenuOpened ? <ArrowRight2 {...arrowStyle} /> : <ArrowUp2 {...arrowStyle} />}</>
                  ) : (
                    <ArrowDown2 {...arrowStyle} />
                  )}
                </Box>
              ))}

            {!drawerOpen && (
              <PopperStyled open={miniMenuOpened} anchorEl={anchorEl} placement="right-start" sx={{ zIndex: 2001 }}>
                {({ TransitionProps }) => (
                  <Transitions in={miniMenuOpened} {...TransitionProps}>
                    <Paper
                      sx={(theme) => ({
                        overflow: 'hidden',
                        boxShadow: theme.customShadows.z1,
                        backgroundImage: 'none',
                        border: '1px solid ',
                        borderColor: 'divider'
                      })}
                    >
                      <ClickAwayListener onClickAway={handleClose}>
                        <SimpleBar sx={{ overflowX: 'hidden', overflowY: 'auto', maxHeight: 'calc(100vh - 170px)' }}>
                          {navCollapse}
                        </SimpleBar>
                      </ClickAwayListener>
                    </Paper>
                  </Transitions>
                )}
              </PopperStyled>
            )}
          </ListItemButton>
          {drawerOpen && !menu?.isDropdown && (
            <Collapse in={open} timeout="auto" unmountOnExit>
              <List sx={{ py: 0, px: level <= 1 ? 1.5 : 0 }}>{navCollapse}</List>
            </Collapse>
          )}
          {drawerOpen && menu?.isDropdown && (
            <Menu
              id={`${menu.id}-menu`}
              aria-labelledby={`${menu.id}-button`}
              anchorEl={anchorElCollapse}
              open={openCollapse}
              onClose={handleCloseCollapse}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right'
              }}
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right'
              }}
              slotProps={{ paper: { sx: { boxShadow: theme.shadows[2] } } }}
            >
              {navCollapse}
            </Menu>
          )}
        </>
      ) : (
        <ListItemButton
          id={`boundary-${popperId}`}
          selected={isSelected}
          onMouseEnter={handleHover}
          onMouseLeave={handleClose}
          onClick={handleHover}
          aria-describedby={popperId}
          disableTouchRipple
          className={anchorEl ? 'Mui-selected' : ''}
          sx={{
            zIndex: 121,
            borderRadius: level >= 1 ? 0 : 1,
            '&.Mui-selected': {
              '&:hover': {
                bgcolor: 'transparent'
              },
              bgcolor: 'transparent'
            }
          }}
        >
          <Box onClick={handlerIconLink} sx={FlexBox}>
            {menuIcon && (
              <ListItemIcon sx={{ my: 'auto', minWidth: !menu.icon ? 18 : 36, color: 'secondary.dark' }}>{menuIcon}</ListItemIcon>
            )}
            <ListItemText
              primary={
                <Typography
                  variant="h6"
                  sx={(theme) => ({
                    fontWeight: isSelected || anchorEl ? 500 : 400,
                    color: lightTextColor,
                    ...theme.applyStyles('dark', { color: darkTextColor })
                  })}
                >
                  <FormattedMessage id={menu.title} />
                </Typography>
              }
            />
            <Box component="span" sx={(theme) => ({ color: lightTextColor, ...theme.applyStyles('dark', { color: darkTextColor }) })}>
              {miniMenuOpened ? <ArrowRight2 size={12} /> : <ArrowDown2 size={12} />}
            </Box>
          </Box>

          {anchorEl && (
            <PopperStyled
              id={popperId}
              open={miniMenuOpened}
              anchorEl={anchorEl}
              placement="right-start"
              sx={{ zIndex: 2001 }}
              modifiers={[{ name: 'offset', options: { offset: [-14, 0] } }]}
            >
              {({ TransitionProps }) => (
                <Transitions in={miniMenuOpened} {...TransitionProps}>
                  <Paper
                    sx={(theme) => ({
                      overflow: 'hidden',
                      py: 0.5,
                      boxShadow: theme.customShadows.z1,
                      border: '1px solid ',
                      borderColor: 'divider',
                      backgroundImage: 'none'
                    })}
                  >
                    <ClickAwayListener onClickAway={handleClose}>
                      <SimpleBar sx={{ overflowX: 'hidden', overflowY: 'auto', maxHeight: 'calc(100vh - 170px)' }}>{navCollapse}</SimpleBar>
                    </ClickAwayListener>
                  </Paper>
                </Transitions>
              )}
            </PopperStyled>
          )}
        </ListItemButton>
      )}
    </>
  );
}
