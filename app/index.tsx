import PageActivityIndicator from '@/components/util/PageActivityIndicator';
import { ToastMessages } from '@/constants/Messages';
import { clearCache } from '@/helpers/util';
import { 
    dbFirstRun, 
    dbIsSafeModeEnabled, 
    dbSetLastRefresh, 
    dbShouldClearCache, 
    dbShouldUpdate, 
    dbUpdateDatabase 
} from '@/lib/database';
import { AppStyle } from '@/styles/AppStyle';
import {
    LeagueSpartan_200ExtraLight,
    LeagueSpartan_400Regular,
    LeagueSpartan_600SemiBold,
    useFonts
} from '@expo-google-fonts/league-spartan';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';
import { router } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import React, { useEffect, useRef } from 'react';
import { SafeAreaView } from 'react-native';
import Toast from 'react-native-toast-message';


const App = () => {

    const db = useSQLiteContext()

    const isInitialized = useRef(false)

    let [fontsLoaded] = useFonts({
        LeagueSpartan_200ExtraLight,
        LeagueSpartan_400Regular,
        LeagueSpartan_600SemiBold
    });

    useEffect(
        () => {
            if (isInitialized.current) { return }
            isInitialized.current = true
            async function init() {
                if (await dbShouldClearCache(db)) {
                    await clearCache()
                }
                
                await dbFirstRun(db)
                
                const state: NetInfoState = await NetInfo.fetch()
                if (!state.isConnected) {
                    Toast.show(ToastMessages.EN.NO_INTERNET)
                    router.replace("/(pages)/HomePage")
                    return
                }

                if (await dbShouldUpdate(db, 'server')) {
                    Toast.show(ToastMessages.EN.SYNC_LOCAL_DATABASE)
                    await dbSetLastRefresh(db, 'client')
                    await dbUpdateDatabase(db)
                    Toast.show(ToastMessages.EN.SYNC_LOCAL_DATABASE_COMPLETED)
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