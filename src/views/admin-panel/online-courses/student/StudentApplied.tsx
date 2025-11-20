// project-imports
import Breadcrumbs from 'components/@extended/Breadcrumbs';
import { APP_DEFAULT_PATH } from 'config';

import AppliedStudent from 'sections/admin-panel/online-courses/students/applied';

const breadcrumbLinks = [{ title: 'home', to: APP_DEFAULT_PATH }, { title: 'online-courses' }, { title: 'student' }, { title: 'applied' }];

// ==============================|| STUDENT - APPLIED ||============================== //

export default function StudentAppliedPage() {
  return (
    <>
      <Breadcrumbs custom heading="applied" links={breadcrumbLinks} />
      <AppliedStudent />
    </>
  );
}
