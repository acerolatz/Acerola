import PageActivityIndicator from '@/components/util/PageActivityIndicator';
import { clearCache, hasInternetAvailable } from '@/helpers/util';
import { useAppVersionState } from '@/store/appVersionState';
import { useSettingsState } from '@/store/settingsState';
import { ToastMessages } from '@/constants/Messages';
import React, { useEffect, useRef } from 'react';
import { useSQLiteContext } from 'expo-sqlite';
import Toast from 'react-native-toast-message';
import { AppStyle } from '@/styles/AppStyle';
import { SafeAreaView } from 'react-native';
import { router } from 'expo-router';
import {    
    dbFirstRun,
    dbGetAppVersion,
    dbIsSafeModeEnabled,
    dbLoadSettings,
    dbSetLastRefresh,
    dbShouldClearCache,
    dbShouldUpdate,
    dbUpdateDatabase
} from '@/lib/database';
import {
    LeagueSpartan_200ExtraLight,
    LeagueSpartan_400Regular,
    LeagueSpartan_600SemiBold,
    useFonts
} from '@expo-google-fonts/league-spartan';


const App = () => {

    const db = useSQLiteContext()
    const isInitialized = useRef(false);

    const { setLocalVersion } = useAppVersionState()
    const { setSettings } = useSettingsState()

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

    const loadSettings = async () => {
        const s = await dbLoadSettings(db)   
        setSettings(s)
    }

    useEffect(
        () => {
            if (isInitialized.current) return;
            isInitialized.current = true;
            const init = async () => {
                
                await Promise.all([
                    handleCache(),
                    updateLocalVersion(),
                    loadSettings(),
                    dbFirstRun(db)
                ])

                if (await dbIsSafeModeEnabled(db)) {
                    router.replace("/(pages)/SafeModeHomePage")
                    return
                }
                
                const hasInternet = await hasInternetAvailable()

                if (!hasInternet) {
                    Toast.show(ToastMessages.EN.NO_INTERNET);
                    router.replace("/(pages)/HomePage");
                    return;
                }                
                
                if (await dbShouldUpdate(db, 'server')) {
                    Toast.show(ToastMessages.EN.SYNC_LOCAL_DATABASE);
                    await dbUpdateDatabase(db);
                    await dbSetLastRefresh(db, 'client');
                    Toast.show(ToastMessages.EN.SYNC_LOCAL_DATABASE_COMPLETED);
                }

                router.replace("/(pages)/HomePage")
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