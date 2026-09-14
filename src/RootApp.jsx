import { CapacitorUpdater } from '@capgo/capacitor-updater';
import SystemUpdater from './ERP/components/shared/SystemUpdater';
import { setupPushNotifications } from './Shared/utils/PushEngine';
import { Capacitor } from '@capacitor/core';
/* © 2026 JSM VALOR. All Rights Reserved. */
import React, { Suspense } from 'react';
import { useLocation } from 'react-router-dom';
import Preloader from './Website/components/UI/Preloader/Preloader';
import RouteSkeleton from './Website/components/UI/RouteSkeleton';
import ErpSkeleton from './ERP/components/shared/ErpSkeleton';
import ScrollToTop from './Website/components/UI/ScrollToTop';
import App from './App';
import { SiteProvider } from './Website/context/SiteContext';
import { ErpProvider } from './ERP/context/ErpContext';
import ErpApp from './ERP/ErpApp';

const ErpWrapper = () => {
  return (
    <Suspense fallback={<ErpSkeleton />}>
      <ErpProvider>
        <ErpApp />
      </ErpProvider>
    </Suspense>
  );
};

const RootApp = () => {
  React.useEffect(() => {
    setupPushNotifications(null);
    CapacitorUpdater.notifyAppReady();
  }, []);

  const location = useLocation();
  const path = location.pathname.toLowerCase();
  const isErpRoute = Capacitor.isNativePlatform() || path.startsWith('/erp') || 
                     path.startsWith('/login') || 
                     path.startsWith('/student') || 
                     path.startsWith('/faculty') || 
                     path.startsWith('/admin') || 
                     path.startsWith('/verify');
  return (
    <SystemUpdater>
    <>
      <Preloader />
      <ScrollToTop />
      {isErpRoute ? <ErpWrapper /> : (
        <SiteProvider>
          <Suspense fallback={<RouteSkeleton />}>
            <App />
          </Suspense>
        </SiteProvider>
      )}
      </>
    </SystemUpdater>
  );
};

export default RootApp;
