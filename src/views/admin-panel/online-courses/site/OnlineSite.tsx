'use client';

import { useState } from 'react';

// material-ui
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import Stepper from '@mui/material/Stepper';

// project-imports
import Breadcrumbs from 'components/@extended/Breadcrumbs';
import MainCard from 'components/MainCard';
import { APP_DEFAULT_PATH } from 'config';

import AddBio from 'sections/admin-panel/online-courses/site/AddBio';
import SiteTheme from 'sections/admin-panel/online-courses/site/SiteTheme';
import SiteDomain from 'sections/admin-panel/online-courses/site/SiteDomain';
import SiteBio from 'sections/admin-panel/online-courses/site/SiteBio';
import SitePage from 'sections/admin-panel/online-courses/site/SitePage';

// assets
import { Add, ArrowLeft2, ArrowRight2, Save2 } from '@wandersonalwes/iconsax-react';

const steps = [
  { label: 'Theme', section: <SiteTheme /> },
  { label: 'Domain', section: <SiteDomain /> },
  { label: 'Bio', section: <SiteBio /> },
  { label: 'Page', section: <SitePage /> }
];

// ==============================|| SITE ||============================== //

export default function OnlineSitePage() {
  const [activeStep, setActiveStep] = useState(0);
  const [openAddBioModal, setOpenAddBioModal] = useState(false);

  const handleStepChange = (index: number) => {
    setActiveStep(index);
  };

  const breadcrumbLinks = [{ title: 'home', to: APP_DEFAULT_PATH }, { title: 'online-courses' }, { title: 'site' }];
  const commonIconStyle = { svg: { width: 14, height: 14, path: { strokeWidth: 2 } } };
  const stepIconSize = 32;

  function TabActions() {
    switch (activeStep) {
      case 0:
        return (
          <Button size="small" endIcon={<Save2 />} sx={{ '.MuiButton-endIcon svg path': { strokeWidth: 2 } }}>
            Save
          </Button>
        );
      case 2:
        return (
          <Button
            size="small"
            variant="contained"
            startIcon={<Add />}
            sx={{ '.MuiButton-startIcon svg path': { strokeWidth: 2 } }}
            onClick={() => setOpenAddBioModal(true)}
          >
            Add Bio
          </Button>
        );
      case 3:
        return (
          <Button size="small" variant="contained" startIcon={<Add />} sx={{ '.MuiButton-startIcon svg path': { strokeWidth: 2 } }}>
            Add Page
          </Button>
        );
      default:
        return null;
    }
  }

  return (
    <>
      <Breadcrumbs custom heading="site" links={breadcrumbLinks} />
      <MainCard
        title={steps[activeStep].label}
        contentSX={{ p: 2.5 }}
        secondary={
          <Stack direction="row" sx={{ gap: 1 }}>
            <TabActions />
            {activeStep !== 0 && (
              <Button
                size="small"
                variant="contained"
                startIcon={<ArrowLeft2 />}
                sx={{ '.MuiButton-startIcon': { mr: 0.5, ...commonIconStyle } }}
                onClick={() => handleStepChange(activeStep - 1)}
              >
                Previous
              </Button>
            )}
            {activeStep < steps.length - 1 && (
              <Button
                size="small"
                variant="contained"
                endIcon={<ArrowRight2 />}
                sx={{ '.MuiButton-endIcon': { ml: 0.5, ...commonIconStyle } }}
                onClick={() => handleStepChange(activeStep + 1)}
              >
                Next
              </Button>
            )}
          </Stack>
        }
      >
        <Stack direction="row" sx={{ justifyContent: 'center', pt: 6.25, pb: 8.75 }}>
          <Stepper
            activeStep={activeStep}
            alternativeLabel
            sx={{ width: { xs: 1, sm: '50%' }, justifyContent: 'center', '& .MuiStepConnector-root': { top: stepIconSize / 2 } }}
          >
            {steps.map((step, index) => (
              <Step
                key={index}
                completed={activeStep > index}
                onClick={() => handleStepChange(index)}
                sx={{ '& .MuiStepIcon-root': { width: stepIconSize, height: stepIconSize } }}
              >
                <StepLabel
                  sx={{ '& .MuiStepLabel-label.MuiStepLabel-alternativeLabel': { mt: 1 } }}
                  slotProps={{ label: { sx: { typography: 'h6' } } }}
                >
                  {step.label}
                </StepLabel>
              </Step>
            ))}
          </Stepper>
        </Stack>
        {steps[activeStep]?.section}
      </MainCard>
      <AddBio open={openAddBioModal} modalToggler={setOpenAddBioModal} />
    </>
  );
}
