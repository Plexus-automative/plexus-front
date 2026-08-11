import { Fragment, useLayoutEffect, useState } from 'react';

// material-ui
import useMediaQuery from '@mui/material/useMediaQuery';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

// project-imports
import NavGroup from './NavGroup';
import NavItem from './NavItem';
import { useGetMenuMaster } from 'api/menu';
import { MenuOrientation, HORIZONTAL_MAX_ITEM } from 'config';
import useConfig from 'hooks/useConfig';
import useUser from 'hooks/useUser';
import menuItem from 'menu-items';

// types
import { NavItemType } from 'types/menu';

function isFound(arr: any, str: string) {
  return arr.items.some((element: any) => {
    if (element.id === str) {
      return true;
    }
    return false;
  });
}

// ==============================|| DRAWER CONTENT - NAVIGATION ||============================== //

export default function Navigation() {
  const downLG = useMediaQuery((theme) => theme.breakpoints.down('lg'));

  const { menuOrientation } = useConfig();
  const { menuMaster } = useGetMenuMaster();
  const drawerOpen = menuMaster.isDashboardDrawerOpened;

  const user = useUser();
  const [selectedID, setSelectedID] = useState<string | null>(menuMaster.openedHorizontalItem);
  const [selectedItems, setSelectedItems] = useState<string | undefined>('');
  const [selectedLevel, setSelectedLevel] = useState<number>(0);
  const [menuItems, setMenuItems] = useState<{ items: NavItemType[] }>({ items: [] });

  useLayoutEffect(() => {
    const currentItems = [...menuItem.items];

    // Role-based filtering
    const userRole = user ? user.role : '';
    const filteredItems = currentItems.map((group) => {
      if (group.id === 'group-applications' && group.children) {
        const filteredChildren = group.children.filter((child) => {
          const isBrisItem = child.id === 'bris-de-glace-creation' || child.id === 'bris-de-glace-consultation';

          // Bris de glace glass-users see ONLY the two dossier pages
          if (user && user.isBriseDeGlace) {
            return isBrisItem;
          }
          // Plexus (C0090) also gets the consultation page to review ALL dossiers
          if (child.id === 'bris-de-glace-consultation') {
            return !!(user && user.customerNo === 'C0090');
          }
          // The creation page is reserved for glass-users
          if (child.id === 'bris-de-glace-creation') {
            return false;
          }

          // Demandes de devis arrive from the commercial mobile app and are handled by
          // Plexus (C0090) only. Checked again server-side off the signed JWT claim —
          // hiding a menu entry is presentation, not access control.
          if (child.id === 'demandes-devis') {
            return !!(user && user.customerNo === 'C0090');
          }

          // Hide Rapport Assurances from all users
          if (child.id === 'rapport-assurance') {
            return false;
          }

          // Dashboard is restricted to client C0082 only
          if (child.id === 'dashboard' && (!user || user.customerNo !== 'C0082')) {
            return false;
          }

          if (userRole === 'Client and Fournisseur') return true;

          if (userRole === 'Fournisseur') {
            return ['dashboard', 'commandes-recus', 'commandes-livrees', 'mes-bl', 'panier', 'add-reference', (user && user.catalogType?.toLowerCase() === 'catalogue nouveau' ? 'connexion-catalogue' : '')].includes(child.id!);
          }
          if (userRole === 'Client') {
            const allowed = [
              'dashboard',
              'articles',
              'commandes-emis',
              'validation-reception',
              'panier',
              'add-reference',
              'plexus-pec-commandes',
              (user && user.catalogType?.toLowerCase() === 'catalogue nouveau' ? 'connexion-catalogue' : '')
            ];
            return allowed.includes(child.id!);
          }
          return true; // Fallback for other roles (admin, etc.) if any
        });
        return { ...group, children: filteredChildren };
      }
      return group;
    });

    setMenuItems({ items: filteredItems });
    // eslint-disable-next-line
  }, [user ? user.role : '', user ? user.catalogType : '', user ? user.customerNo : '', user ? user.isBriseDeGlace : false]);

  const isHorizontal = menuOrientation === MenuOrientation.HORIZONTAL && !downLG;


  const lastItem = isHorizontal ? HORIZONTAL_MAX_ITEM : null;
  let lastItemIndex = menuItems.items.length - 1;
  let remItems: NavItemType[] = [];
  let lastItemId: string;

  if (lastItem && lastItem < menuItems.items.length) {
    lastItemId = menuItems.items[lastItem - 1].id!;
    lastItemIndex = lastItem - 1;
    remItems = menuItems.items.slice(lastItem - 1, menuItems.items.length).map((item) => ({
      title: item.title,
      elements: item.children,
      icon: item.icon,
      ...(item.url && {
        url: item.url
      })
    }));
  }

  const navGroups = menuItems.items.slice(0, lastItemIndex + 1).map((item) => {
    switch (item.type) {
      case 'group':
        if (item.url && item.id !== lastItemId) {
          return (
            <Fragment key={item.id}>
              {menuOrientation !== MenuOrientation.HORIZONTAL && <Divider sx={{ my: 0.5 }} />}
              <NavItem item={item} level={1} isParents setSelectedID={() => setSelectedID('')} />
            </Fragment>
          );
        }
        return (
          <NavGroup
            key={item.id}
            selectedID={selectedID}
            setSelectedID={setSelectedID}
            setSelectedItems={setSelectedItems}
            setSelectedLevel={setSelectedLevel}
            selectedLevel={selectedLevel}
            selectedItems={selectedItems}
            lastItem={lastItem!}
            remItems={remItems}
            lastItemId={lastItemId}
            item={item}
          />
        );
      default:
        return (
          <Typography key={item.id} variant="h6" color="error" align="center">
            Fix - Navigation Group
          </Typography>
        );
    }
  });
  return (
    <Box
      sx={{
        pt: drawerOpen ? (isHorizontal ? 0 : 2) : 0,
        '& > ul:first-of-type': { mt: 0 },
        display: isHorizontal ? { xs: 'block', lg: 'flex' } : 'block',
        alignItems: 'center'
      }}
    >
      {navGroups}
    </Box>
  );
}
