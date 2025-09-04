import { clearCache, hasInternetAvailable } from '@/helpers/util';
import { useAppVersionState } from '@/hooks/appVersionState';
import { downloadManager } from '@/helpers/DownloadManager';
import { ToastMessages } from '@/constants/Messages';
import { useEffect, useRef, useState } from 'react';
import { initManhwasDir } from '@/helpers/storage';
import Toast from 'react-native-toast-message';
import { useSQLiteContext } from 'expo-sqlite';
import { router } from 'expo-router';
import {
  dbHandleFirstRun,
  dbReadAppVersion,
  dbIsSafeModeEnabled,
  dbShouldClearCache,
  dbShouldSyncDatabase,
  dbSyncDatabase,
} from '@/lib/database';


export function useAppInit() {
  const db = useSQLiteContext();
  const isInitialized = useRef(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const setLocalVersion = useAppVersionState(a => a.setLocalVersion);

  useEffect(() => {
    if (isInitialized.current) return;
    isInitialized.current = true;

    const init = async () => {
      try {
        
        const updateLocalVersion = async () => {
          const version = await dbReadAppVersion(db);
          setLocalVersion(version);
        };
        
        const handleCache = async () => {
          if (await dbShouldClearCache(db)) await clearCache();
        };
        
        const [isSafeModeEnabled, hasInternet] = await Promise.all([
          dbIsSafeModeEnabled(db),
          hasInternetAvailable(),
          handleCache(),
          updateLocalVersion(),
          dbHandleFirstRun(db),
          initManhwasDir(),
          downloadManager.init(db),
        ]);
        
        if (isSafeModeEnabled) {
          router.replace('/(pages)/SafeModeHomePage');
          return;
        }

        if (!hasInternet) {
          Toast.show(ToastMessages.EN.NO_INTERNET);
          router.replace('/(pages)/HomePage');
          return;
        }
        
        if (await dbShouldSyncDatabase(db)) {
          Toast.show(ToastMessages.EN.SYNC_LOCAL_DATABASE);
          await dbSyncDatabase(db);
          Toast.show(ToastMessages.EN.SYNC_LOCAL_DATABASE_COMPLETED);
        }
        
        router.replace('/(pages)/HomePage');
      } catch (error) {
        console.error('App init failed:', error);
        Toast.show({
          type: 'error',
          text1: 'Initialization Error',
          text2: 'Please restart the app.',
        });
      } finally {
        setIsInitializing(false);
      }
    };

    init();
  }, []);

  return { isInitializing };
}
