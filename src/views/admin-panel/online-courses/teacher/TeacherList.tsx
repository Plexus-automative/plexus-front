// project-imports
import Breadcrumbs from 'components/@extended/Breadcrumbs';
import { APP_DEFAULT_PATH } from 'config';

import TeacherList from 'sections/admin-panel/online-courses/teachers/list';

const breadcrumbLinks = [{ title: 'home', to: APP_DEFAULT_PATH }, { title: 'online-courses' }, { title: 'teacher' }, { title: 'list' }];

// ==============================|| TEACHER - LIST ||============================== //

export default function TeacherListPage() {
  return (
    <>
      <Breadcrumbs custom heading="list" links={breadcrumbLinks} />
      <TeacherList />
    </>
  );
}
