'use client';

// material-ui
import { RichTreeView, TreeViewBaseItem } from '@mui/x-tree-view';
import Box from '@mui/material/Box';

// project-imports
import MainCard from 'components/MainCard';

const data: TreeViewBaseItem[] = [
  {
    id: 'parent1',
    label: 'Parent - 1',
    children: [
      { id: 'child1', label: 'Child - 1' },
      {
        id: 'child2',
        label: 'Child - 2',
        children: [
          { id: 'child2-1', label: 'Child - 2.1' },
          { id: 'child2-2', label: 'Child - 2.2' }
        ]
      }
    ]
  },
  {
    id: 'parent2',
    label: 'Parent - 2',
    children: [
      { id: 'child3', label: 'Child - 3' },
      { id: 'child4', label: 'Child - 4' }
    ]
  }
];

// ==============================|| TREE VIEW - RICH OBJECT ||============================== //

export default function RichObjectTreeView() {
  const richTreeviewCodeString = `// RichObjectTreeView.tsx
<Box sx={{ height: 180, maxWidth: 400, overflowY: 'auto' }}>
  <RichTreeView items={data} />
</Box>`;

  return (
    <MainCard title="Rich Tree View" codeString={richTreeviewCodeString}>
      <Box sx={{ height: 180, maxWidth: 400, overflowY: 'auto' }}>
        <RichTreeView items={data} />
      </Box>
    </MainCard>
  );
}
