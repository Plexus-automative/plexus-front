import { useDeferredValue, useMemo } from 'react';

// material-ui
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

// project-imports
import NavGroup from './NavGroup';
import menuItem from 'menu-items/components';

// types
import { NavItemType } from 'types/menu';

// ==============================|| DRAWER - NAVIGATION ||============================== //

export default function Navigation({ searchValue }: { searchValue?: string }) {
  const deferredSearch = useDeferredValue(searchValue?.trim().toLowerCase() ?? '');

  const filteredMenuItems = useMemo(() => {
    if (!deferredSearch) return menuItem;

    const result: NavItemType[] = [];
    menuItem.forEach((parentMenu) => {
      const matchedChildren = parentMenu.children?.filter((child) => child.search?.toLowerCase().includes(deferredSearch));

      if (matchedChildren && matchedChildren.length > 0) {
        result.push({ ...parentMenu, children: matchedChildren });
      }
    });

    return result;
  }, [deferredSearch]);

  const navGroups = filteredMenuItems.map((item) => {
    switch (item.type) {
      case 'group':
        return <NavGroup key={item.id} item={item} />;
      default:
        return (
          <Typography key={item.id} variant="h6" color="error" align="center">
            Fix - Navigation Group
          </Typography>
        );
    }
  });

  return <Box sx={{ pt: 1 }}>{navGroups}</Box>;
}
