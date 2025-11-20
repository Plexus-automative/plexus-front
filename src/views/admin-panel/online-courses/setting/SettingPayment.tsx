// project-imports
import Breadcrumbs from 'components/@extended/Breadcrumbs';
import { APP_DEFAULT_PATH } from 'config';

import PaymentSection from 'sections/admin-panel/online-courses/setting/PaymentSection';

const breadcrumbLinks = [{ title: 'home', to: APP_DEFAULT_PATH }, { title: 'online-courses' }, { title: 'setting' }, { title: 'payment' }];

// ==============================|| SETTING - PAYMENT ||============================== //

export default function SettingPaymentPage() {
  return (
    <>
      <Breadcrumbs custom heading="payment" links={breadcrumbLinks} />
      <PaymentSection />
    </>
  );
}
