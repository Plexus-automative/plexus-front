import { ReactNode, SyntheticEvent, useState } from 'react';

// material-ui
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Box from '@mui/material/Box';

// project-imports
import MainCard from 'components/MainCard';
import PageTable from './PageTable';

interface TabPanelProps {
  children?: ReactNode;
  index: number;
  value: number;
}

function a11yProps(index: number) {
  return { id: `simple-tab-${index}`, 'aria-controls': `simple-tabpanel-${index}` };
}

function TabPanel({ children, value, index, ...other }: TabPanelProps) {
  return (
    <div role="tabpanel" hidden={value !== index} id={`simple-tabpanel-${index}`} aria-labelledby={`simple-tab-${index}`} {...other}>
      {value === index && <Box>{children}</Box>}
    </div>
  );
}

// ==============================|| SITE - PAGE ||============================== //

export default function SitePage() {
  const [value, setValue] = useState(0);

  const handleChange = (event: SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };
  return (
    <MainCard content={false}>
      <Box sx={{ px: 3, pt: 1 }}>
        <Tabs value={value} onChange={handleChange}>
          <Tab label="School Pages" {...a11yProps(0)} />
          <Tab label="Product Pages" {...a11yProps(1)} />
        </Tabs>
      </Box>
      <TabPanel value={value} index={0}>
        <PageTable />
      </TabPanel>
      <TabPanel value={value} index={1}>
        <PageTable />
      </TabPanel>
    </MainCard>
  );
}
