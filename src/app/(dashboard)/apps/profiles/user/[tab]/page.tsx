import UserProfile from 'views/apps/UserProfile';

// ==============================|| PROFILE - USER ||============================== //

type Props = {
  params: Promise<{ tab: string }>;
};

// Multiple versions of this page will be statically generated
// using the `params` returned by `generateStaticParams`
export default async function Page({ params }: Props) {
  const { tab } = await params;

  return <UserProfile tab={tab} />;
}

// Return a list of `params` to populate the [slug] dynamic segment
export async function generateStaticParams() {
  const response = ['personal', 'payment', 'password', 'settings'];

  return response.map((tab: string) => ({
    tab: tab
  }));
}
