import KanbanApp from 'views/apps/Kanban';

// ==============================|| APPLICATION - KANBAN ||============================== //

type Props = {
  params: Promise<{ tab: string }>;
};

// Multiple versions of this page will be statically generated
// using the `params` returned by `generateStaticParams`
export default async function Page({ params }: Props) {
  const { tab } = await params;

  return <KanbanApp tab={tab} />;
}

// Return a list of `params` to populate the [slug] dynamic segment
export async function generateStaticParams() {
  const response = ['board', 'backlogs'];

  return response.map((tab: string) => ({
    tab: tab
  }));
}
