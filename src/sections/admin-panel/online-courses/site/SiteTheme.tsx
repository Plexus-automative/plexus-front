import { useEffect, useState } from 'react';

// material-ui
import { styled, SxProps } from '@mui/material/styles';
import Button from '@mui/material/Button';
import CardMedia from '@mui/material/CardMedia';
import Divider from '@mui/material/Divider';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import MenuItem from '@mui/material/MenuItem';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

// third-party
import { useDropzone } from 'react-dropzone';

// project-imports
import ColorPickerCard from 'components/cards/ColorPickerCard';
import ColorPreview from 'components/ColorPreview';
import MainCard from 'components/MainCard';

// assets
import { DocumentUpload, Trash } from '@wandersonalwes/iconsax-react';
const ImgStar = '/assets/images/online-panel/img-star.png';

interface BrandingProps {
  title: string;
  notes: string;
}

interface UploadFileProps {
  item: BrandingProps;
  file: File | null;
  preview: string | null;
  onDrop: (files: File[]) => void;
  onRemove: () => void;
  sx?: SxProps;
}

const brandingSections: BrandingProps[] = [
  { title: 'Logo', notes: '250 x 60 pixels (PNG or JPG)' },
  { title: 'Thumbnail', notes: '960 x 540 pixels (PNG or JPG)' },
  { title: 'Favicon', notes: '32 x 32 pixels (PNG or JPG)' }
];

const presets = [
  { id: 'preset_1', title: 'Preset 1', subTitle: 'Theme Color', colors: ['#2CA87F', '#96D4BF', '#C0E5D9'] },
  { id: 'preset_2', title: 'Preset 2', subTitle: 'Theme Color', colors: ['#EDAD4D', '#F2C580', '#F7DCB3'] },
  { id: 'preset_3', title: 'Preset 3', subTitle: 'Theme Color', colors: ['#6293FF', '#7EA6FF', '#C8D9FF'] },
  { id: 'preset_4', title: 'Preset 4', subTitle: 'Theme Color', colors: ['#CB5BFF', '#DD95FF', '#EDC6FF'] },
  { id: 'preset_5', title: 'Preset 5', subTitle: 'Theme Color', colors: ['#5B6B79', '#9FA2AA', '#CFD1D4'] }
];

const otherColorOptions = [
  { id: 'other_1', title: 'Nav Bar & Footer Background', subTitle: 'Fixed, scrolling & email', color: '#96D4BF' },
  { id: 'other_2', title: 'Navigation Bar Link', subTitle: 'Links when nav bar is fixed', color: '#FF602E' },
  { id: 'other_3', title: 'Navigation Bar', subTitle: 'Links when nav bar is scrolling', color: '#96C9D4' },
  { id: 'other_4', title: 'Homepage Headings & Subtitle', subTitle: 'When a background is set', color: '#A7A6A6' },
  { id: 'other_5', title: 'Course Page Heading & Subtitle', subTitle: 'When a background is set', color: '#E6F5F0' },
  { id: 'other_6', title: 'Headings', subTitle: '<h1> to <h5>', color: '#737373' },
  { id: 'other_7', title: 'Body text', subTitle: '<body>, <p>', color: '#3A3A3A' },
  { id: 'other_8', title: 'Buttons & Links', subTitle: '<a>, <button>', color: '#2CA87F' }
];

const DropzoneContainer = styled(Box)(({ theme }) => ({
  border: '1px dashed',
  borderColor: theme.palette.secondary.main,
  height: 180,
  borderRadius: '8px',
  padding: '20px',
  display: 'flex',
  gap: 8,
  alignItems: 'center',
  justifyContent: 'center'
}));

// ==============================|| SECTION TITLE ||============================== //

function SectionTitle({ title, subHeading }: { title: string; subHeading: string }) {
  return (
    <Stack sx={{ gap: 0.5 }}>
      <Typography variant="h5">{title}</Typography>
      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
        {subHeading}
      </Typography>
    </Stack>
  );
}

// ==============================|| UPLOAD FILE ||============================== //

function UploadFile({ item, file, preview, onDrop, onRemove, sx }: UploadFileProps) {
  const { getRootProps, getInputProps, open } = useDropzone({ onDrop, accept: { 'image/*': [] }, noClick: true });

  return (
    <Stack sx={{ gap: 1, ...sx }}>
      <Typography>{item.title}</Typography>
      <DropzoneContainer {...getRootProps()}>
        {preview ? (
          <Stack sx={{ gap: 1.5, alignItems: 'center' }}>
            <CardMedia
              component="img"
              alt={file?.name || ''}
              src={preview}
              sx={{
                borderRadius: 8,
                width: 100,
                height: 100,
                objectFit: 'cover'
              }}
            />
            <Stack direction="row" sx={{ gap: 1, alignItems: 'center' }}>
              <input {...getInputProps()} />
              <Button onClick={open}>Change {item.title}</Button>
              <IconButton color="error" onClick={onRemove}>
                <Trash size={20} />
              </IconButton>
            </Stack>
          </Stack>
        ) : (
          <Stack
            sx={{
              gap: 1.25,
              width: 1,
              height: 1,
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 1,
              bgcolor: 'background.default'
            }}
          >
            <input {...getInputProps()} />
            <Button variant="outlined" color="secondary" startIcon={<DocumentUpload />} onClick={open}>
              Click to Upload {item.title}
            </Button>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              {item.notes}
            </Typography>
          </Stack>
        )}
      </DropzoneContainer>
    </Stack>
  );
}

// ==============================|| SITE THEME ||============================== //

export default function SiteTheme() {
  const [uploads, setUploads] = useState<Record<string, { file: File | null; preview: string | null }>>({});

  const [font, setFont] = useState('Open sans');
  const [selectedPreset, setSelectedPreset] = useState('preset_3');
  const [colorOptions, setColorOptions] = useState(otherColorOptions);

  const handleChange = (event: SelectChangeEvent) => {
    setFont(event.target.value);
  };

  const handleDrop = (label: string) => (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      const previewURL = URL.createObjectURL(file);

      setUploads((prev) => ({ ...prev, [label]: { file, preview: previewURL } }));
    }
  };

  // Cleanup preview URLs on unmount
  useEffect(() => {
    return () => {
      Object.values(uploads).forEach(({ preview }) => {
        if (preview) {
          URL.revokeObjectURL(preview);
        }
      });
    };
  }, [uploads]);

  const handleRemove = (label: string) => {
    setUploads((prev) => ({
      ...prev,
      [label]: { file: null, preview: null }
    }));
  };

  // Function to handle color change
  const handleColorChange = (id: string, newColor: string) => {
    setColorOptions((prev) => prev.map((option) => (option.id === id ? { ...option, color: newColor } : option)));
  };

  return (
    <>
      <Stack sx={{ gap: 2.5 }}>
        <SectionTitle
          title="Logo & Branding"
          subHeading="Incorporate a custom logo and favicon, and fine-tune your school thumbnail to enhance its appearance and branding"
        />
        <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 2.5, '& > *': { flex: '1 1 calc(33.333% - 20px)' } }}>
          {brandingSections.map((item) => {
            const { file, preview } = uploads[item.title] || { file: null, preview: null };
            return (
              <UploadFile
                key={item.title}
                item={item}
                file={file}
                preview={preview}
                onDrop={handleDrop(item.title)}
                onRemove={() => handleRemove(item.title)}
                sx={{ minWidth: 280 }}
              />
            );
          })}
        </Stack>
      </Stack>
      <Divider sx={{ my: 2.5 }} />
      <Stack sx={{ gap: 5 }}>
        <Stack direction="row" sx={{ alignContent: 'baseline', gap: 1.25 }}>
          <CardMedia component="img" sx={{ width: 66, height: 66 }} src={ImgStar} alt="Star-Img" />
          <Stack sx={{ justifyContent: 'center', gap: 0.5 }}>
            <Typography sx={{ fontWeight: 'bold' }}>Able pro Branding</Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              Personalize your school and eliminate Able Pro branding from your school website, emails, and products. To access this
              feature, upgrade to the Professional plan.
            </Typography>
          </Stack>
        </Stack>

        <Stack sx={{ gap: 2.5 }}>
          <SectionTitle title="Font Family" subHeading="Change the font used across your school." />
          <MainCard content={false} sx={{ p: 2.5, maxWidth: 735 }}>
            <Stack sx={{ gap: 2 }}>
              <Select value={font} sx={{ width: 130 }} onChange={handleChange}>
                <MenuItem value="Open sans">Open Sans</MenuItem>
                <MenuItem value="Inter">Inter</MenuItem>
                <MenuItem value="Poppins">Poppins</MenuItem>
                <MenuItem value="Roboto">Roboto</MenuItem>
              </Select>
              <Typography variant="caption" sx={{ color: 'text.secondary', fontFamily: font }}>
                Make your school your own and remove Teachable branding from your school website, emails, and all products. Upgrade to the
                Professional plan to use this feature.
              </Typography>
            </Stack>
          </MainCard>
        </Stack>

        <Stack sx={{ gap: 2.5 }}>
          <SectionTitle
            title="Color Palette"
            subHeading="Select a predefined color scheme to establish consistency across your site and products. Alternatively, customize your own color palette to reflect your unique branding and preferences."
          />
          <MainCard content={false} sx={{ p: 2.5 }}>
            <FormControl component="fieldset" sx={{ width: 1 }}>
              <RadioGroup
                value={selectedPreset}
                onChange={(event) => {
                  const selectedPlan = presets.find((data) => data.id === event.target.value);
                  if (selectedPlan) {
                    setSelectedPreset(selectedPlan.id);
                  }
                }}
                sx={{ width: 1, gap: 1.5 }}
              >
                <Grid container spacing={2.5}>
                  {presets.map((item, index) => (
                    <Grid key={index} size={{ xs: 12, sm: 4, md: 2.4 }}>
                      <FormControlLabel
                        value={item.id}
                        control={<Radio sx={{ display: 'none' }} />}
                        slotProps={{ typography: { sx: { width: 1 } } }}
                        label={
                          <MainCard
                            content={false}
                            sx={{
                              p: 2.5,
                              cursor: 'pointer',
                              ...(selectedPreset !== item.id && { borderColor: 'transparent' }),
                              ...(selectedPreset === item.id && { bgcolor: 'secondary.lighter' })
                            }}
                          >
                            <Typography sx={{ fontWeight: 'bold' }}>{item.title}</Typography>
                            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                              {item.subTitle}
                            </Typography>
                            <MainCard content={false} sx={{ mt: 1.25, p: 1.25 }}>
                              <Stack direction="row" sx={{ gap: 1.25, justifyContent: 'center' }}>
                                {item.colors.map((color, colorIndex) => (
                                  <ColorPreview key={colorIndex} color={color} />
                                ))}
                              </Stack>
                            </MainCard>
                          </MainCard>
                        }
                        sx={{ width: 1, m: 0 }}
                      />
                    </Grid>
                  ))}
                </Grid>
              </RadioGroup>
            </FormControl>

            <Grid container spacing={2.5} sx={{ mt: 2.5 }}>
              {colorOptions.map((item, index) => (
                <Grid key={index} size={{ xs: 12, sm: 6, md: 3 }}>
                  <Typography sx={{ fontWeight: 'bold' }}>{item.title}</Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    {item.subTitle}
                  </Typography>
                  <ColorPickerCard
                    color={item.color}
                    cardSx={{ mt: 1.25 }}
                    onColorChange={(newColor) => handleColorChange(item.id, newColor)}
                  />
                </Grid>
              ))}
            </Grid>
          </MainCard>
        </Stack>
      </Stack>
    </>
  );
}
