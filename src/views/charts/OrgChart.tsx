'use client';

import { Fragment } from 'react';

// next
import dynamic from 'next/dynamic';

// material-ui
import { alpha, useTheme } from '@mui/material/styles';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';

// project-imports
import MainCard from 'components/MainCard';
import { GRID_COMMON_SPACING } from 'config';
import { data } from 'data/org-chart';
import Card from 'sections/charts/org-chart/Card';
import DataCard from 'sections/charts/org-chart/DataCard';

// types
import { TreeMiddleWare, TreeCardmiddleWare } from 'types/org-chart';

// third-party
import { TreeNodeProps, TreeProps } from 'react-organizational-chart';
const Tree = dynamic<TreeProps>(() => import('react-organizational-chart').then((mod) => mod.Tree), {
  ssr: false
});

const TreeNode = dynamic<TreeNodeProps>(() => import('react-organizational-chart').then((mod) => mod.TreeNode), {
  ssr: false
});

// ==============================|| ORGANIZATION CHARTS ||============================== //

function SimpleTree({ name }: TreeMiddleWare) {
  return (
    <Typography
      sx={(theme) => ({
        p: 1.25,
        border: '1px solid ',
        borderColor: 'primary.light',
        width: 'max-content',
        m: 'auto',
        color: 'primary.main',
        bgcolor: alpha(theme.palette.secondary.lighter, 0.6),
        borderRadius: 1
      })}
    >
      {name}
    </Typography>
  );
}

function TreeCard({ items }: TreeCardmiddleWare) {
  return (
    <>
      {items.map((item: any, id: any) => (
        <Fragment key={id}>
          {item.children ? (
            <TreeNode label={<SimpleTree name={item.name} />}>
              <TreeCard items={item.children} />
            </TreeNode>
          ) : (
            <TreeNode label={<SimpleTree name={item.name} />} />
          )}
        </Fragment>
      ))}
    </>
  );
}

export default function OrgChartPage() {
  const theme = useTheme();

  return (
    <Grid container spacing={GRID_COMMON_SPACING} sx={{ justifyContent: 'center' }}>
      <Grid size={12}>
        <MainCard title="Simple Chart" contentSX={{ overflow: 'auto', direction: theme.direction }}>
          <Tree lineWidth="1px" lineColor={theme.palette.primary.main} lineBorderRadius="4px" label={<SimpleTree name={data[0].name} />}>
            <TreeCard items={data[0].children} />
          </Tree>
        </MainCard>
      </Grid>
      <Grid size={12}>
        <MainCard title="Styled Chart" contentSX={{ overflow: 'auto', direction: theme.direction }}>
          <Tree
            lineWidth="1px"
            lineColor={theme.palette.primary.main}
            lineBorderRadius="4px"
            label={
              <DataCard
                name={data[0].name}
                role={data[0].role}
                avatar={data[0].avatar}
                linkedin={data[0].linkedin}
                facebook={data[0].facebook}
                twitter={data[0].twitter}
                root
              />
            }
          >
            <Card items={data[0].children} />
          </Tree>
        </MainCard>
      </Grid>
    </Grid>
  );
}
