import { useState } from 'react';

// material-ui
import Grid from '@mui/material/Grid';

// project-imports
import FilePreview from './FilePreview';
import FileShare from './ShareModal';
import FileCard from 'components/cards/file-manager/FileCard';
import { GRID_COMMON_SPACING } from 'config';

// types
import { FileItem } from 'types/file-manager';

interface CardViewProps {
  files: FileItem[];
}

// ==============================|| FILE MANAGER - CARDS ||============================== //

export default function CardView({ files }: CardViewProps) {
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null);

  const [previewDrawer, setPreviewDrawer] = useState<boolean>(false);
  const [shareModal, setShareModal] = useState<boolean>(false);

  return (
    <>
      <Grid container spacing={GRID_COMMON_SPACING}>
        {files.map((file, index) => (
          <Grid key={index} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
            <FileCard
              {...file}
              selected={selectedFile?.name === file.name}
              onSelect={() => setSelectedFile(file)}
              openDrawer={previewDrawer}
              setOpenDrawer={setPreviewDrawer}
              setOpenModal={setShareModal}
            />
          </Grid>
        ))}
      </Grid>
      <FilePreview openDrawer={previewDrawer} setOpenDrawer={setPreviewDrawer} selectedFile={selectedFile} />
      <FileShare setOpenModal={setShareModal} openModal={shareModal} />
    </>
  );
}
