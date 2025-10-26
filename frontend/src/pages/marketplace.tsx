import { useSelector } from 'react-redux';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { RootState } from '@/store';
import dynamic from 'next/dynamic';
import { Marketplace } from "@/components/Marketplace";

const DashboardLayout = dynamic(
  () => import('@/components/DashboardLayout').then(mod => mod.DashboardLayout),
  { ssr: false }
);

export default function MarketplacePage() {
  const { currentUser } = useSelector((state: RootState) => state.user);
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted && !currentUser) {
      router.push('/login');
    }
  }, [currentUser, router, isMounted]);

  // Prevent rendering anything until the client-side auth check is complete
  if (!isMounted || !currentUser) {
    return <div className="flex justify-center items-center min-h-screen">Redirection...</div>;
  }

  return (
    <DashboardLayout>
      <Marketplace />
    </DashboardLayout>
  );
}