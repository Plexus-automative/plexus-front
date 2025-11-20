// project-imports
import Breadcrumbs from 'components/@extended/Breadcrumbs';
import { APP_DEFAULT_PATH } from 'config';

import AppliedTeacher from 'sections/admin-panel/online-courses/teachers/applied';

const breadcrumbLinks = [{ title: 'home', to: APP_DEFAULT_PATH }, { title: 'online-courses' }, { title: 'teacher' }, { title: 'applied' }];

// ==============================|| TEACHER - APPLIED ||============================== //

export default function AppliedTeacherPage() {
  return (
    <>
      <Breadcrumbs custom heading="applied" links={breadcrumbLinks} />
      <AppliedTeacher />
    </>
  );
}
