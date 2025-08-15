import PageActivityIndicator from '@/components/util/PageActivityIndicator';
import { AppStyle } from '@/styles/AppStyle';
import {
    LeagueSpartan_200ExtraLight,
    LeagueSpartan_400Regular,
    LeagueSpartan_600SemiBold,
    useFonts
} from '@expo-google-fonts/league-spartan';
import React, { useEffect, useRef } from 'react';
import { SafeAreaView } from 'react-native';
import { clearCache } from '@/helpers/util';
import { ToastMessages } from '@/constants/Messages';
import {
  dbFirstRun,
  dbGetAppVersion,
  dbIsSafeModeEnabled,
  dbSetLastRefresh,
  dbShouldClearCache,
  dbShouldUpdate,
  dbUpdateDatabase
} from '@/lib/database';
import NetInfo from '@react-native-community/netinfo';
import Toast from 'react-native-toast-message';
import { router } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useAppVersionState } from '@/store/appVersionState';


const App = () => {

    const db = useSQLiteContext()
    const isInitialized = useRef(false);

    const { setLocalVersion } = useAppVersionState()

    let [fontsLoaded] = useFonts({
        LeagueSpartan_200ExtraLight,
        LeagueSpartan_400Regular,
        LeagueSpartan_600SemiBold
    });

    const updateLocalVersion = async () => {
        const l = await dbGetAppVersion(db)
        setLocalVersion(l)
    }

    const handleCache = async () => {
        if (await dbShouldClearCache(db)) {
            await clearCache();
        }
    }

    useEffect(
        () => {
            if (isInitialized.current) return;
            isInitialized.current = true;
            const init = async () => {
                
                await Promise.all([
                    handleCache(),
                    updateLocalVersion(),
                    dbFirstRun(db)
                ])
                
                const state = await NetInfo.fetch();
                if (!state.isConnected) {
                    Toast.show(ToastMessages.EN.NO_INTERNET);
                    router.replace("/(pages)/HomePage");
                    return;
                }
                
                if (await dbShouldUpdate(db, 'server')) {
                    Toast.show(ToastMessages.EN.SYNC_LOCAL_DATABASE);
                    await dbSetLastRefresh(db, 'client');
                    await dbUpdateDatabase(db);
                    Toast.show(ToastMessages.EN.SYNC_LOCAL_DATABASE_COMPLETED);
                }

                if (await dbIsSafeModeEnabled(db)) {
                    router.replace("/(pages)/SafeModeHomePage")
                } else {
                    router.replace("/(pages)/HomePage")
                }
            }
            init()
        },
        [db]
    )

    return (
        <SafeAreaView style={AppStyle.safeArea} >
            <PageActivityIndicator/>
        </SafeAreaView>
    )
}

export default App