import DonationBottomSheet from '@/components/bottomsheet/DonationBottomSheet'
import NewAppReleaseBottomSheet from '@/components/bottomsheet/NewAppReleaseBottomSheet'
import Button from '@/components/buttons/Button'
import RandomManhwaButton from '@/components/buttons/OpenRandomManhwaButton'
import UpdateDatabaseButton from '@/components/buttons/UpdateDatabaseButton'
import CollectionGrid from '@/components/grid/CollectionsGrid'
import ContinueReadingGrid from '@/components/grid/ContinueReadingGrid'
import GenreGrid from '@/components/grid/GenreGrid'
import LatestUpdatesGrid from '@/components/grid/LatestUpdatesGrid'
import MostPopularGrid from '@/components/grid/MostPopularGrid'
import RandomCardsGrid from '@/components/grid/RandomCardsGrid'
import Top10Grid from '@/components/grid/Top10Grid'
import LateralMenu from '@/components/LateralMenu'
import Column from '@/components/util/Column'
import Footer from '@/components/util/Footer'
import AppLogo from '@/components/util/Logo'
import Row from '@/components/util/Row'
import { AppConstants } from '@/constants/AppConstants'
import { Colors } from '@/constants/Colors'
import { Typography } from '@/constants/typography'
import { Collection, Genre, Manhwa } from '@/helpers/types'
import { 
    dbCleanTable, 
    dbGetReadingHistory,     
    dbReadCollections, 
    dbReadGenres, 
    dbReadManhwasOrderedByUpdateAt, 
    dbReadManhwasOrderedByViews,     
    dbShouldUpdate, 
    dbUpsertCollections 
} from '@/lib/database'
import { 
    spFetchCollections,  
    spFetchRandomManhwaCards, 
    spGetTodayTop10 
} from '@/lib/supabase'
import { useCollectionState } from '@/store/collectionsState'
import { useManhwaCardsState } from '@/store/randomManhwaState'
import { useTop10ManhwasState } from '@/store/top10State'
import { AppStyle } from '@/styles/AppStyle'
import { router, useFocusEffect } from 'expo-router'
import { useSQLiteContext } from 'expo-sqlite'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { 
    Animated, 
    Pressable, 
    SafeAreaView, 
    ScrollView, 
    StyleSheet    
} from 'react-native'


const PAGE_LIMIT = 32

const HomePage = () => {

    const db = useSQLiteContext()

    // Lateral Menu
    const menuAnim = useRef(new Animated.Value(-AppConstants.PAGES.HOME.MENU_WIDTH)).current 
    const backgroundAnim = useRef(new Animated.Value(-AppConstants.COMMON.SCREEN_WIDTH)).current
    const menuVisible = useRef(false)    
    
    const { cards, setCards } = useManhwaCardsState()    
    
    const { top10manhwas, setTop10manhwas } = useTop10ManhwasState()
    const { collections, setCollections } = useCollectionState()
    const [loading, setLoading] = useState(true)
    const [genres, setGenres] = useState<Genre[]>([])
    const [latestUpdate, setLatestUpdates] = useState<Manhwa[]>([])
    const [mostView, setMostView] = useState<Manhwa[]>([])    
    const [readingHistoryManhwas, setReadingHistoryManhwas] = useState<Manhwa[]>([])

    const reloadCards = async () => {
        const r = await spFetchRandomManhwaCards(PAGE_LIMIT)
        setCards(r.map(c => {
            const normalizedHeight = c.height > AppConstants.COMMON.RANDOM_MANHWAS.MAX_HEIGHT ? 
                AppConstants.COMMON.RANDOM_MANHWAS.MAX_HEIGHT : c.height
            
            let normalizedWidth = (normalizedHeight * c.width) / c.height

            normalizedWidth = normalizedWidth > AppConstants.COMMON.RANDOM_MANHWAS.MAX_WIDTH ? 
                AppConstants.COMMON.RANDOM_MANHWAS.MAX_WIDTH : normalizedWidth
                
            return {...c, normalizedWidth, normalizedHeight}
        }))
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
    
    useEffect(
        () => {
            const init = async () => {
                setLoading(true)
                    await Promise.all([
                        dbReadGenres(db),
                        dbReadManhwasOrderedByUpdateAt(db, 0, PAGE_LIMIT),
                        dbReadManhwasOrderedByViews(db, 0, PAGE_LIMIT)
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
                    await dbGetReadingHistory(db, 0, PAGE_LIMIT)
                        .then(v => setReadingHistoryManhwas(v))
                }
                reload()
            },[]))

    const openMenu = () => {
        Animated.timing(menuAnim, {
            toValue: 0,
            duration: AppConstants.PAGES.HOME.MENU_ANIMATION_TIME,
            useNativeDriver: true
        }).start(() => {
            menuVisible.current = true
        })
        Animated.timing(backgroundAnim, {
            toValue: 0,
            duration: AppConstants.PAGES.HOME.MENU_ANIMATION_TIME * 1.2,
            useNativeDriver: true
        }).start()
    }

    const closeMenu = () => {
        Animated.timing(menuAnim, {
            toValue: -AppConstants.PAGES.HOME.MENU_WIDTH,
            duration: AppConstants.PAGES.HOME.MENU_ANIMATION_TIME,
            useNativeDriver: true
        }).start(() => {
            menuVisible.current = false
        })
        Animated.timing(backgroundAnim, {
            toValue: -AppConstants.COMMON.SCREEN_WIDTH,
            duration: AppConstants.PAGES.HOME.MENU_ANIMATION_TIME,
            useNativeDriver: true
        }).start()
    }

    const openManhwaSearch = () => {
        router.navigate("/(pages)/ManhwaSearch")
    }

    const toggleMenu = () => {
        menuVisible.current ? closeMenu() : openMenu()
    }

    return (
        <SafeAreaView style={AppStyle.safeArea} >
            {/* Header */}
            <Row style={styles.header} >
                <AppLogo/>
                <Row style={{gap: AppConstants.ICON.SIZE}} >
                    {
                        !loading &&
                        <>
                            <UpdateDatabaseButton type='client' />
                            <Button iconName='search-outline' onPress={openManhwaSearch} />
                            <RandomManhwaButton />
                        </>
                    }
                    <Button iconName='options-outline' onPress={toggleMenu} />
                </Row>
            </Row>

            {/* Main content */}
            <ScrollView style={{flex: 1}} showsVerticalScrollIndicator={false} >
                <Column style={{gap: AppConstants.COMMON.GAP}} >
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
        paddingRight: 2, 
        marginTop: 4, 
        marginBottom: 10, 
        justifyContent: "space-between"
    },
    sideMenu: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 0,        
        backgroundColor: Colors.backgroundColor,
        width: AppConstants.PAGES.HOME.MENU_WIDTH,
        elevation: 5,        
        zIndex: 100
    },
    menuBackground: {
        width: AppConstants.COMMON.SCREEN_WIDTH,
        position: 'absolute',
        height: AppConstants.COMMON.SCREEN_HEIGHT * 1.2,
        top: 0,
        left: 0,        
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        elevation: 4,        
        zIndex: 90
    },
    button: {
        borderRadius: AppConstants.COMMON.BORDER_RADIUS,
        backgroundColor: Colors.yellow,
        alignItems: "center",
        justifyContent: "center",
        flex: 1,
        height: 52
    },
    bottomSheetContainer: {
        paddingHorizontal: AppConstants.COMMON.SCREEN_PADDING_HORIZONTAL, 
        paddingTop: 10,
        gap: AppConstants.COMMON.GAP
    },
    handleStyle: {
        backgroundColor: Colors.backgroundSecondary, 
        borderTopLeftRadius: 12, 
        borderTopEndRadius: 12
    },
    handleIndicatorStyle: {
        backgroundColor: Colors.yellow
    },
    bottomSheetBackgroundStyle: {
        backgroundColor: Colors.backgroundSecondary
    },
    textLink: {
        ...Typography.light,
        marginTop: 10,
        textDecorationLine: 'underline'
    }
})