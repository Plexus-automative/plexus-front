import { useState } from 'react';
import { Fragment } from 'react/jsx-runtime';

// material-ui
import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

// project-imports
import SimpleBar from 'components/third-party/SimpleBar';
import { mainItems, accordions } from './data/mail';

interface MailNavigationProps {
  onSelect: (menu: string) => void;
  getCount: (label: string) => number;
  closeDetail: () => void;
}

const commonSummaryProps = {
  expandIcon: null,
  slotProps: { content: { sx: { mx: 0 } } }
};

// ==============================|| MAIL NAVIGATION ||============================== //

export default function MailNavigation({ onSelect, getCount, closeDetail }: MailNavigationProps) {
  const [selectedLabel, setSelectedMenu] = useState<string>('');

  return (
    <SimpleBar sx={{ height: { xs: 'calc(100vh - 110px)', lg: 1 } }}>
      <List disablePadding>
        {mainItems.map((item) => {
          const IconComponent = item.icon;
          const count = getCount(item.label);
          return (
            <ListItem key={item.label} disablePadding>
              <ListItemButton
                sx={{ px: 2.5 }}
                onClick={() => {
                  onSelect(item.label);
                  setSelectedMenu(item.label);
                  closeDetail();
                }}
                selected={selectedLabel === item.label}
              >
                <ListItemIcon sx={{ minWidth: 38 }}>
                  <IconComponent size={20} />
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Typography variant="h6" sx={{ color: 'secondary.main' }}>
                      {item.label}
                    </Typography>
                  }
                />
                {item.count && <Chip label={count} size="small" />}
              </ListItemButton>
            </ListItem>
          );
        })}

        <Divider sx={{ opacity: 0.5, my: 0.5 }} />

        <Box sx={{ '& .MuiAccordion-root': { border: 'none', '& .MuiAccordionDetails-root': { p: 0, border: 'none' } } }}>
          {accordions.map((section, index) => (
            <Fragment key={index}>
              <Accordion defaultExpanded>
                <AccordionSummary
                  aria-controls={`${index}-content`}
                  id={`${section.title}-header`}
                  {...commonSummaryProps}
                  sx={{ backgroundColor: 'background.paper' }}
                >
                  <Typography variant="h6" color="text.secondary">
                    {section.title}
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  {section.items.map((sub) => {
                    const IconComponent = sub.icon;
                    const count = getCount(sub.label);
                    return (
                      <ListItem key={sub.label} disablePadding>
                        <ListItemButton
                          sx={{ px: 2.5 }}
                          onClick={() => {
                            onSelect(sub.label);
                            setSelectedMenu(sub.label);
                            closeDetail();
                          }}
                          selected={selectedLabel === sub.label}
                        >
                          <ListItemIcon sx={{ minWidth: 38, color: sub.color ?? 'inherit' }}>
                            <IconComponent size={20} />
                          </ListItemIcon>
                          <ListItemText
                            primary={
                              <Typography variant="h6" sx={{ color: 'secondary.main' }}>
                                {sub.label}
                              </Typography>
                            }
                          />
                          {sub.count && <Chip label={count} size="small" />}
                        </ListItemButton>
                      </ListItem>
                    );
                  })}
                </AccordionDetails>
              </Accordion>
              {index !== accordions.length - 1 && <Divider sx={{ opacity: 0.5, my: 0.5 }} />}
            </Fragment>
          ))}
        </Box>
      </List>
    </SimpleBar>
  );
}
