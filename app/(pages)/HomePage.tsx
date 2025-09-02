import NewAppReleaseBottomSheet from '@/components/bottomsheet/NewAppReleaseBottomSheet'
import DonationBottomSheet from '@/components/bottomsheet/DonationBottomSheet'
import RandomManhwaButton from '@/components/buttons/OpenRandomManhwaButton'
import UpdateDatabaseButton from '@/components/buttons/UpdateDatabaseButton'
import ContinueReadingGrid from '@/components/grid/ContinueReadingGrid'
import LatestUpdatesGrid from '@/components/grid/LatestUpdatesGrid'
import MostPopularGrid from '@/components/grid/MostPopularGrid'
import RandomCardsGrid from '@/components/grid/RandomCardsGrid'
import CollectionGrid from '@/components/grid/CollectionsGrid'
import { AppConstants } from '@/constants/AppConstants'
import GenreGrid from '@/components/grid/GenreGrid'
import Top10Grid from '@/components/grid/Top10Grid'
import LateralMenu from '@/components/LateralMenu'
import Button from '@/components/buttons/Button'
import { Genre, Manhwa } from '@/helpers/types'
import Column from '@/components/util/Column'
import Footer from '@/components/util/Footer'
import AppLogo from '@/components/util/Logo'
import { Colors } from '@/constants/Colors'
import Row from '@/components/util/Row'
import {
    dbGetManhwaReadingHistory,         
    dbReadAll,         
    dbReadGenres, 
    dbReadManhwasOrderedByUpdateAt, 
    dbReadManhwasOrderedByViews
} from '@/lib/database'
import { 
    spFetchCollections,
    spFetchRandomManhwaCards, 
    spFetchTop10 
} from '@/lib/supabase'
import { useCollectionState } from '@/store/collectionsState'
import { useManhwaCardsState } from '@/store/randomManhwaState'
import { useTop10ManhwasState } from '@/store/top10State'
import { router, useFocusEffect } from 'expo-router'
import { useSQLiteContext } from 'expo-sqlite'
import { AppStyle } from '@/styles/AppStyle'
import React, { 
    useCallback, 
    useEffect, 
    useRef, 
    useState 
} from 'react'
import { 
    Animated, 
    Pressable, 
    SafeAreaView, 
    ScrollView, 
    StyleSheet,
    View
} from 'react-native'
import { Image } from 'expo-image'


const HomePage = () => {

    const db = useSQLiteContext()
    const { cards, setCards } = useManhwaCardsState()    

    const { top10manhwas, setTop10manhwas } = useTop10ManhwasState()
    const { collections, setCollections } = useCollectionState()
    const [genres, setGenres] = useState<Genre[]>([])
    const [loading, setLoading] = useState(true)
    const [latestUpdate, setLatestUpdates] = useState<Manhwa[]>([])
    const [mostView, setMostView] = useState<Manhwa[]>([])    
    const [readingHistoryManhwas, setReadingHistoryManhwas] = useState<Manhwa[]>([])

    // Lateral Menu
    const menuAnim = useRef(new Animated.Value(-AppConstants.UI.MENU.WIDTH)).current 
    const backgroundAnim = useRef(new Animated.Value(-AppConstants.UI.SCREEN.WIDTH)).current
    const menuVisible = useRef(false)

    const openManhwaSearch = useCallback(() => {
        router.navigate("/(pages)/ManhwaSearch")
    }, [])

    const reloadCards = async () => {
        const r = await spFetchRandomManhwaCards(AppConstants.VALIDATION.PAGE_LIMIT);
        setCards(r);
    }

    const updateCollections = async () => {
        if (collections.length === 0) {
            const c = await spFetchCollections();
            setCollections(c);
        }
    }        

    const updateTop10 = async () => {
        if (top10manhwas.length === 0) {
            const t = await spFetchTop10();
            setTop10manhwas(t);
        }
    }

    const updateRandomCards = async () => {
        if (cards.length === 0) { await reloadCards(); }
    }
        
    const reloadTop10 = async () => {
        const t = await spFetchTop10()
        setTop10manhwas(t)
    }

    const toggleMenu = () => {
        menuVisible.current ? closeMenu() : openMenu()
    }

    useEffect(() => {
            let mounted = true;
            setLoading(true);
            (async () => {
                const [g, l, m] = await Promise.all([
                    dbReadGenres(db),
                    dbReadManhwasOrderedByUpdateAt(db, 0, AppConstants.VALIDATION.PAGE_LIMIT),
                    dbReadManhwasOrderedByViews(db, 0, AppConstants.VALIDATION.PAGE_LIMIT),
                ]);

                if (!mounted) { return }
                setGenres(g)
                setLatestUpdates(l);
                setMostView(m);

                await Promise.all([
                    updateTop10(),
                    updateCollections(),
                    updateRandomCards(),
                ]);

                if (mounted) setLoading(false);
            })();

            return () => { mounted = false };
    }, []);

    useFocusEffect(
        useCallback(() => {
            const reload = async () => {
                Image.clearMemoryCache();
                const v = await dbGetManhwaReadingHistory(db, 0, AppConstants.VALIDATION.PAGE_LIMIT);
                setReadingHistoryManhwas(v);
            };
            reload();
    }, [db]));

    const openMenu = () => {
        Animated.timing(menuAnim, {
            toValue: 0,
            duration: AppConstants.UI.ANIMATION_TIME,
            useNativeDriver: true
        }).start(() => {
            menuVisible.current = true
        })
        Animated.timing(backgroundAnim, {
            toValue: 0,
            duration: AppConstants.UI.ANIMATION_TIME * 1.2,
            useNativeDriver: true
        }).start()
    }

    const closeMenu = () => {
        Animated.timing(menuAnim, {
            toValue: -AppConstants.UI.MENU.WIDTH,
            duration: AppConstants.UI.ANIMATION_TIME,
            useNativeDriver: true
        }).start(() => {
            menuVisible.current = false
        })
        Animated.timing(backgroundAnim, {
            toValue: -AppConstants.UI.SCREEN.WIDTH,
            duration: AppConstants.UI.ANIMATION_TIME,
            useNativeDriver: true
        }).start()
    }

    return (
        <SafeAreaView style={AppStyle.safeArea} >
            <ScrollView style={{flex: 1}} showsVerticalScrollIndicator={false}>
                <Row style={styles.header}>
                    <AppLogo />
                    <Row style={{ gap: AppConstants.UI.ICON.SIZE }}>
                        {!loading && (
                            <>
                                {AppConstants.APP.DEBUG.ENABLED && <Button iconName='bug-outline' onPress={() => router.navigate("/(pages)/DebugPage")} />}
                                <UpdateDatabaseButton />
                                <Button iconName="search-outline" onPress={openManhwaSearch} />
                                <RandomManhwaButton />
                            </>
                        )}
                        <Button iconName="options-outline" onPress={toggleMenu} />
                    </Row>
                </Row>
                <Column style={{gap: AppConstants.UI.GAP}} >
                    <GenreGrid genres={genres} />
                    <CollectionGrid collections={collections} />
                    <ContinueReadingGrid manhwas={readingHistoryManhwas} />
                    <Top10Grid manhwas={top10manhwas} reloadTop10={reloadTop10} />
                    <LatestUpdatesGrid manhwas={latestUpdate} />
                    <MostPopularGrid manhwas={mostView} />
                    { !loading && <RandomCardsGrid reloadCards={reloadCards} /> }
                    <Footer height={20} />
                </Column>
            </ScrollView>

            {/* BottomSheet */}
            <NewAppReleaseBottomSheet/>            
            <DonationBottomSheet/>

            {/* Lateral Menu */}
            <Animated.View style={[styles.menuBackground, { transform: [{ translateX: backgroundAnim }] }]}>
                <Pressable onPress={closeMenu} style={styles.lateralMenuBackground} />
            </Animated.View>
            <Animated.View style={[styles.sideMenu, { transform: [{ translateX: menuAnim }] }]}>
                <LateralMenu closeMenu={closeMenu}/>
            </Animated.View>
        </SafeAreaView>
    )
}


export default HomePage


const styles = StyleSheet.create({
    lateralMenuBackground: {
        width: '100%', 
        height: '100%'
    },
    header: {
        width: '100%', 
        justifyContent: "space-between",
        paddingBottom: AppConstants.UI.GAP * 2
    },
    sideMenu: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 0,        
        backgroundColor: Colors.backgroundColor,
        width: AppConstants.UI.MENU.WIDTH,
        elevation: 5,        
        zIndex: 100
    },
    menuBackground: {
        width: AppConstants.UI.SCREEN.WIDTH,
        position: 'absolute',
        height: AppConstants.UI.SCREEN.HEIGHT * 1.2,
        top: 0,
        left: 0,        
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        elevation: 4,        
        zIndex: 90
    }
})