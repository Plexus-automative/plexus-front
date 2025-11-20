// project-imports
import Breadcrumbs from 'components/@extended/Breadcrumbs';
import { APP_DEFAULT_PATH } from 'config';

import StudentList from 'sections/admin-panel/online-courses/students/list';

const breadcrumbLinks = [{ title: 'home', to: APP_DEFAULT_PATH }, { title: 'online-courses' }, { title: 'student' }, { title: 'list' }];

// ==============================|| STUDENT - LIST ||============================== //

export default function StudentListPage() {
  return (
    <>
      <Breadcrumbs custom heading="list" links={breadcrumbLinks} />
      <StudentList />
    </>
  );
}
