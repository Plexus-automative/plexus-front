// material-ui
import useMediaQuery from '@mui/material/useMediaQuery';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

// project-imports
import ColorOptions from './ColorOptions';
import IconButton from 'components/@extended/IconButton';

// types
import { ProductsFilter } from 'types/e-commerce';

// assets
import { Add } from '@wandersonalwes/iconsax-react';

function getColor(color: string) {
  return ColorOptions.filter((item: any) => item.value === color);
}

interface ProductFilterViewProps {
  filter: ProductsFilter;
  initialState: ProductsFilter;
  filterIsEqual: (initialState: ProductsFilter, filter: ProductsFilter) => boolean;
  handleFilter: (type: string, params: string, rating?: number) => void;
}

// ==============================|| PRODUCT - FILTER VIEW ||============================== //

export default function ProductFilterView({ filter, filterIsEqual, handleFilter, initialState }: ProductFilterViewProps) {
  const downLG = useMediaQuery((theme) => theme.breakpoints.down('lg'));

  return (
    <>
      {!filterIsEqual(initialState, filter) && (
        <Stack sx={{ gap: 2 }}>
          <Typography variant="h5">Active Filters</Typography>
          {!(initialState.search === filter.search) && (
            <Grid>
              <Stack direction="row" sx={{ alignItems: 'center', ml: '-10px' }}>
                <Chip
                  size={downLG ? 'small' : undefined}
                  label={filter.search}
                  sx={{
                    borderRadius: '4px',
                    textTransform: 'capitalize',
                    color: 'secondary.main',
                    bgcolor: 'inherit',
                    '& .MuiSvgIcon-root': { color: `grey` }
                  }}
                />
                <IconButton
                  color="secondary"
                  size="small"
                  disableRipple
                  sx={{ '&:hover': { bgcolor: 'transparent' }, ml: -1.5, '&::after': { content: 'none' } }}
                  onClick={() => handleFilter('search', '')}
                >
                  <Add style={{ transform: 'rotate(45deg)' }} />
                </IconButton>
              </Stack>
            </Grid>
          )}
          {!(initialState.sort === filter.sort) && (
            <Grid>
              <Stack>
                <Typography variant="subtitle1">Sort</Typography>
                <Stack direction="row" sx={{ alignItems: 'center', ml: '-10px' }}>
                  <Chip
                    size={downLG ? 'small' : undefined}
                    label={filter.sort}
                    sx={{
                      borderRadius: '4px',
                      textTransform: 'capitalize',
                      color: 'secondary.main',
                      bgcolor: 'inherit',
                      '& .MuiSvgIcon-root': { color: `grey` }
                    }}
                  />
                  <IconButton
                    color="secondary"
                    size="small"
                    disableRipple
                    sx={{ '&:hover': { bgcolor: 'transparent' }, ml: -1.5, '&::after': { content: 'none' } }}
                    onClick={() => handleFilter('sort', initialState.sort)}
                  >
                    <Add style={{ transform: 'rotate(45deg)' }} />
                  </IconButton>
                </Stack>
              </Stack>
            </Grid>
          )}
          {!(JSON.stringify(initialState.gender) === JSON.stringify(filter.gender)) && (
            <Grid>
              <Stack>
                <Typography variant="subtitle1">Gender</Typography>
                <Grid container sx={{ ml: '-10px' }}>
                  {filter.gender.map((item: string, index: number) => (
                    <Stack direction="row" key={index} sx={{ alignItems: 'center' }}>
                      <Chip
                        size={downLG ? 'small' : undefined}
                        label={item}
                        sx={{
                          borderRadius: '4px',
                          textTransform: 'capitalize',
                          color: 'secondary.main',
                          bgcolor: 'inherit',
                          '& .MuiSvgIcon-root': { color: `grey` }
                        }}
                      />
                      <IconButton
                        color="secondary"
                        size="small"
                        disableRipple
                        sx={{ '&:hover': { bgcolor: 'transparent' }, ml: -1.5, '&::after': { content: 'none' } }}
                        onClick={() => handleFilter('gender', item)}
                      >
                        <Add style={{ transform: 'rotate(45deg)' }} />
                      </IconButton>
                    </Stack>
                  ))}
                </Grid>
              </Stack>
            </Grid>
          )}
          {!(JSON.stringify(initialState.categories) === JSON.stringify(filter.categories)) && filter.categories.length > 0 && (
            <Grid>
              <Stack>
                <Typography variant="subtitle1">Categories</Typography>
                <Grid container sx={{ ml: '-10px' }}>
                  {filter.categories.map((item: string, index: number) => (
                    <Stack direction="row" key={index} sx={{ alignItems: 'center' }}>
                      <Chip
                        size={downLG ? 'small' : undefined}
                        label={item}
                        sx={{
                          borderRadius: '4px',
                          textTransform: 'capitalize',
                          color: 'secondary.main',
                          bgcolor: 'inherit',
                          '& .MuiSvgIcon-root': { color: `grey` }
                        }}
                      />
                      <IconButton
                        color="secondary"
                        size="small"
                        disableRipple
                        sx={{ '&:hover': { bgcolor: 'transparent' }, ml: -1.5, '&::after': { content: 'none' } }}
                        onClick={() => handleFilter('categories', item)}
                      >
                        <Add style={{ transform: 'rotate(45deg)' }} />
                      </IconButton>
                    </Stack>
                  ))}
                </Grid>
              </Stack>
            </Grid>
          )}
          {!(JSON.stringify(initialState.colors) === JSON.stringify(filter.colors)) && (
            <Grid>
              <Stack>
                <Typography variant="subtitle1">Colors</Typography>
                <Grid container sx={{ ml: '-10px' }}>
                  {filter.colors.map((item: string, index: number) => {
                    const colorsData = getColor(item);
                    return (
                      <Stack direction="row" key={index} sx={{ alignItems: 'center' }}>
                        <Chip
                          size={downLG ? 'small' : undefined}
                          label={colorsData[0].label}
                          sx={{
                            borderRadius: '4px',
                            textTransform: 'capitalize',
                            color: 'secondary.main',
                            bgcolor: 'inherit',
                            '& .MuiSvgIcon-root': { color: `grey` }
                          }}
                        />
                        <IconButton
                          color="secondary"
                          size="small"
                          disableRipple
                          sx={{ '&:hover': { bgcolor: 'transparent' }, ml: -1.5, '&::after': { content: 'none' } }}
                          onClick={() => handleFilter('colors', item)}
                        >
                          <Add style={{ transform: 'rotate(45deg)' }} />
                        </IconButton>
                      </Stack>
                    );
                  })}
                </Grid>
              </Stack>
            </Grid>
          )}
          {!(initialState.price === filter.price) && (
            <Grid>
              <Stack>
                <Typography variant="subtitle1">Price</Typography>
                <Grid sx={{ ml: '-10px' }}>
                  <Chip
                    size={downLG ? 'small' : undefined}
                    label={filter.price}
                    sx={{
                      borderRadius: '4px',
                      textTransform: 'capitalize',
                      color: 'secondary.main',
                      bgcolor: 'inherit',
                      '& .MuiSvgIcon-root': { color: `grey` }
                    }}
                  />
                </Grid>
              </Stack>
            </Grid>
          )}
          {!(initialState.rating === filter.rating) && (
            <Grid>
              <Stack>
                <Typography variant="subtitle1">Rating</Typography>
                <Grid sx={{ ml: '-10px' }}>
                  <Stack direction="row" sx={{ alignItems: 'center' }}>
                    <Chip
                      size={downLG ? 'small' : undefined}
                      label={String(filter.rating)}
                      sx={{
                        borderRadius: '4px',
                        textTransform: 'capitalize',
                        color: 'secondary.main',
                        bgcolor: 'inherit',
                        '& .MuiSvgIcon-root': { color: `grey` }
                      }}
                    />
                    <IconButton
                      color="secondary"
                      size="small"
                      disableRipple
                      sx={{ '&:hover': { bgcolor: 'transparent' }, ml: -1.5, '&::after': { content: 'none' } }}
                      onClick={() => handleFilter('rating', '', 0)}
                    >
                      <Add style={{ transform: 'rotate(45deg)' }} />
                    </IconButton>
                  </Stack>
                </Grid>
              </Stack>
            </Grid>
          )}
          <Grid>
            <Button variant="text" color="primary" sx={{ ml: '-10px' }} onClick={() => handleFilter('reset', '')}>
              Reset all filters
            </Button>
          </Grid>
          <Grid>
            <Divider sx={{ ml: '-8%', mr: '-8%' }} />
          </Grid>
        </Stack>
      )}
    </>
  );
}
