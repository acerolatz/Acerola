import NewAppReleaseBottomSheet from '@/components/bottomsheet/NewAppReleaseBottomSheet'
import DonationBottomSheet from '@/components/bottomsheet/DonationBottomSheet'
import RandomManhwaButton from '@/components/buttons/OpenRandomManhwaButton'
import UpdateDatabaseButton from '@/components/buttons/UpdateDatabaseButton'
import ContinueReadingGrid from '@/components/grid/ContinueReadingGrid'
import { normalizeRandomManhwaCardHeight } from '@/helpers/normalize'
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
    dbGetReadingHistory,         
    dbReadGenres, 
    dbReadManhwasOrderedByUpdateAt, 
    dbReadManhwasOrderedByViews
} from '@/lib/database'
import { 
    spFetchCollections,  
    spFetchRandomManhwaCards, 
    spGetTodayTop10 
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


const openManhwaSearch = () => {
    router.navigate("/(pages)/ManhwaSearch")
}


/**
 * HomePage component – main screen of the app.
 *
 * Displays a top header with logo and action buttons, multiple manhwa grids
 * (genre, collection, reading history, top 10, latest updates, most popular,
 * random cards), and a footer. Supports lateral menu and bottom sheets
 * for app release info and donations.
 *
 * @remarks
 * - Uses `expo-sqlite` for local database access.
 * - Fetches remote data via Supabase for random cards, top 10, and collections.
 * - Animates lateral menu and background using `Animated.Value`.
 * - `useFocusEffect` reloads reading history when the screen gains focus.
 * - Grid components are lazy-loaded and updated using app state hooks.
 *
 * @hooks
 * - `useState` for local state (loading, genres, manhwas).
 * - `useRef` for menu animation state and references.
 * - `useEffect` to initialize genres, latest updates, most viewed, top 10, collections, random cards.
 * - `useFocusEffect` to reload reading history on screen focus.
 *
 * @components
 * - `GenreGrid`, `CollectionGrid`, `ContinueReadingGrid`, `Top10Grid`, `LatestUpdatesGrid`, `MostPopularGrid`, `RandomCardsGrid`
 * - `NewAppReleaseBottomSheet`, `DonationBottomSheet`
 * - `LateralMenu`, `AppLogo`, `Footer`, `RandomManhwaButton`, `UpdateDatabaseButton`, `Button`
 *
 * @constants
 * - `AppConstants` for layout, animation, and limits.
 * - `Colors` for consistent theming.
 */
const HomePage = () => {

    const db = useSQLiteContext()
    const { cards, setCards } = useManhwaCardsState()    

    const { top10manhwas, setTop10manhwas } = useTop10ManhwasState()
    const { collections, setCollections } = useCollectionState()
    const [loading, setLoading] = useState(true)
    const [genres, setGenres] = useState<Genre[]>([])
    const [latestUpdate, setLatestUpdates] = useState<Manhwa[]>([])
    const [mostView, setMostView] = useState<Manhwa[]>([])    
    const [readingHistoryManhwas, setReadingHistoryManhwas] = useState<Manhwa[]>([])

    // Lateral Menu
    const menuAnim = useRef(new Animated.Value(-AppConstants.MENU_WIDTH)).current 
    const backgroundAnim = useRef(new Animated.Value(-AppConstants.SCREEN.WIDTH)).current
    const menuVisible = useRef(false)

    const reloadCards = async () => {
        const r = await spFetchRandomManhwaCards(AppConstants.PAGE_LIMIT)
        setCards(r)
    }
    
    const updateCollections = async () => {
        if (collections.length === 0) {
            const c = await spFetchCollections()
            setCollections(c)
        }
    }

    const updateTop10 = async () => {
        if (top10manhwas.length === 0) {
            const t = await spGetTodayTop10()
            setTop10manhwas(t)
        }
    }

    const reloadTop10 = async () => {
        const t = await spGetTodayTop10()
        setTop10manhwas(t)
    }

    const updateRandomCards = async () => {
        if (cards.length == 0) {
            await reloadCards()
        }
    }    

    const toggleMenu = () => {
        menuVisible.current ? closeMenu() : openMenu()
    }
    
    useEffect(
        () => {
            const init = async () => {
                setLoading(true)
                    await Promise.all([
                        dbReadGenres(db),
                        dbReadManhwasOrderedByUpdateAt(db, 0, AppConstants.PAGE_LIMIT),
                        dbReadManhwasOrderedByViews(db, 0, AppConstants.PAGE_LIMIT)
                    ]).then(([g, l, m]) => {
                        setGenres(g)
                        setLatestUpdates(l)
                        setMostView(m)
                    })
                setLoading(false)                

                await Promise.all([
                    updateTop10(),
                    updateCollections(),
                    updateRandomCards()
                ])
            }
            init()
        },
        [db]
    )

    useFocusEffect(
        useCallback(
            () => {
                const reload = async () => {
                    await dbGetReadingHistory(db, 0, AppConstants.PAGE_LIMIT)
                        .then(v => setReadingHistoryManhwas(v))
                }
                reload()
            },[]))

    const openMenu = () => {
        Animated.timing(menuAnim, {
            toValue: 0,
            duration: AppConstants.MENU_ANIMATION_TIME,
            useNativeDriver: true
        }).start(() => {
            menuVisible.current = true
        })
        Animated.timing(backgroundAnim, {
            toValue: 0,
            duration: AppConstants.MENU_ANIMATION_TIME * 1.2,
            useNativeDriver: true
        }).start()
    }

    const closeMenu = () => {
        Animated.timing(menuAnim, {
            toValue: -AppConstants.MENU_WIDTH,
            duration: AppConstants.MENU_ANIMATION_TIME,
            useNativeDriver: true
        }).start(() => {
            menuVisible.current = false
        })
        Animated.timing(backgroundAnim, {
            toValue: -AppConstants.SCREEN.WIDTH,
            duration: AppConstants.MENU_ANIMATION_TIME,
            useNativeDriver: true
        }).start()
    }

    return (
        <SafeAreaView style={{...AppStyle.safeArea, paddingTop: 0}} >
            <ScrollView style={{flex: 1}} showsVerticalScrollIndicator={false}>
                <View style={{height: AppConstants.SCREEN.PADDING_VERTICAL}} />
                <Row style={styles.header}>
                    <AppLogo />
                    <Row style={{ gap: AppConstants.ICON.SIZE }}>
                        {!loading && (
                            <>
                            {AppConstants.DEBUB.ENABLED && <Button iconName='bug-outline' onPress={() => router.navigate("/(pages)/DebugPage")} />}
                                <UpdateDatabaseButton type="client" />
                                <Button iconName="search-outline" onPress={openManhwaSearch} />
                                <RandomManhwaButton />
                            </>
                        )}
                        <Button iconName="options-outline" onPress={toggleMenu} />
                    </Row>
                </Row>
                <Column style={{gap: AppConstants.GAP}} >
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
        paddingBottom: AppConstants.GAP * 2
    },
    sideMenu: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 0,        
        backgroundColor: Colors.backgroundColor,
        width: AppConstants.MENU_WIDTH,
        elevation: 5,        
        zIndex: 100
    },
    menuBackground: {
        width: AppConstants.SCREEN.WIDTH,
        position: 'absolute',
        height: AppConstants.SCREEN.HEIGHT * 1.2,
        top: 0,
        left: 0,        
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        elevation: 4,        
        zIndex: 90
    }    
})