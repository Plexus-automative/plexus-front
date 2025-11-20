// project-imports
import Breadcrumbs from 'components/@extended/Breadcrumbs';
import { APP_DEFAULT_PATH } from 'config';

import Pricing from 'sections/admin-panel/online-courses/pricing/pricing';

const breadcrumbLinks = [{ title: 'home', to: APP_DEFAULT_PATH }, { title: 'online-courses' }, { title: 'pricing' }];

// ==============================|| PRICING ||============================== //

export default function OnlinePricingPage() {
  return (
    <>
      <Breadcrumbs custom heading="pricing" links={breadcrumbLinks} />
      <Pricing />
    </>
  );
}
