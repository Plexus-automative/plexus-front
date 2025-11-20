// project-imports
import Breadcrumbs from 'components/@extended/Breadcrumbs';
import { APP_DEFAULT_PATH } from 'config';

import AddStudent from 'sections/admin-panel/online-courses/students/add';

const breadcrumbLinks = [{ title: 'home', to: APP_DEFAULT_PATH }, { title: 'online-courses' }, { title: 'student' }, { title: 'add' }];

// ==============================|| STUDENT - ADD ||============================== //

export default function AddStudentPage() {
  return (
    <>
      <Breadcrumbs custom heading="add" links={breadcrumbLinks} />
      <AddStudent />
    </>
  );
}
