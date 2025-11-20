// project-imports
import Breadcrumbs from 'components/@extended/Breadcrumbs';
import { APP_DEFAULT_PATH } from 'config';

import AddTeacher from 'sections/admin-panel/online-courses/teachers/add';

const breadcrumbLinks = [{ title: 'home', to: APP_DEFAULT_PATH }, { title: 'online-courses' }, { title: 'teacher' }, { title: 'add' }];

// ==============================|| TEACHER - ADD ||============================== //

export default function AddTeacherPage() {
  return (
    <>
      <Breadcrumbs custom heading="add" links={breadcrumbLinks} />
      <AddTeacher />
    </>
  );
}
