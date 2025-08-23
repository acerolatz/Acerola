import PageActivityIndicator from '@/components/util/PageActivityIndicator';
import { clearCache, hasInternetAvailable } from '@/helpers/util';
import { useAppVersionState } from '@/store/appVersionState';
import { ToastMessages } from '@/constants/Messages';
import React, { useEffect, useRef } from 'react';
import { useSQLiteContext } from 'expo-sqlite';
import Toast from 'react-native-toast-message';
import { AppStyle } from '@/styles/AppStyle';
import { SafeAreaView } from 'react-native';
import { router } from 'expo-router';
import {    
    dbFirstRun,
    dbReadAppVersion,
    dbIsSafeModeEnabled,
    dbShouldClearCache,
    dbShouldSyncDatabase,
    dbSyncDatabase    
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

    const setLocalVersion = useAppVersionState(a => a.setLocalVersion)

    let [fontsLoaded] = useFonts({
        LeagueSpartan_200ExtraLight,
        LeagueSpartan_400Regular,
        LeagueSpartan_600SemiBold
    });

    const updateLocalVersion = async () => {
        const l = await dbReadAppVersion(db)
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
                
                if (await dbShouldSyncDatabase(db)) {
                    Toast.show(ToastMessages.EN.SYNC_LOCAL_DATABASE);
                    await dbSyncDatabase(db);
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