// project-imports
import Pricing1 from 'sections/pricing/Pricing1';

import Breadcrumbs from 'components/@extended/Breadcrumbs';
import { APP_DEFAULT_PATH } from 'config';

// ==============================|| SETTING - PRICING ||============================== //

export default function SettingPricingPage() {
  const breadcrumbLinks = [
    { title: 'home', to: APP_DEFAULT_PATH },
    { title: 'online-courses' },
    { title: 'setting' },
    { title: 'pricing' }
  ];
  return (
    <>
      <Breadcrumbs custom heading="pricing" links={breadcrumbLinks} />
      <Pricing1
        title="Plans & pricing"
        description="Every paid plan comes with educational resources and training to support you on your journey, along with a 30-day money-back guarantee."
      />
    </>
  );
}
