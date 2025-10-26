import { useSelector } from 'react-redux';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { RootState } from '@/store';
import dynamic from 'next/dynamic';
import { AdminDashboard } from '@/components/dashboards/AdminDashboard';
import { BuyerDashboard } from '@/components/dashboards/BuyerDashboard';
import { SellerDashboard } from '@/components/dashboards/SellerDashboard';
import { VerifierDashboard } from '@/components/dashboards/VerifierDashboard';

const DashboardLayout = dynamic(
  () => import('@/components/DashboardLayout').then(mod => mod.DashboardLayout),
  { ssr: false }
);

export default function DashboardPage() {
  const { currentUser } = useSelector((state: RootState) => state.user);
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    console.log('Current User State:', currentUser);
    if (isMounted && !currentUser) {
      router.push('/login');
    }
  }, [currentUser, router, isMounted]);

  const renderDashboard = () => {
    switch (currentUser?.user?.profile?.role) {
      case 'ADMIN':
        return <AdminDashboard />;
      case 'BUYER':
        return <BuyerDashboard />;
      case 'SELLER':
        return <SellerDashboard />;
      case 'VERIFIER':
        return <VerifierDashboard />;
      default:
        // Optional: A loading state or a default view
        return <div>Loading dashboard...</div>;
    }
  };

  if (!isMounted || !currentUser) {
    return <div>Redirecting...</div>;
  }

  return (
    <DashboardLayout>
      {renderDashboard()}
    </DashboardLayout>
  );
}
