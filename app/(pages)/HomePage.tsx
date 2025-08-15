import Button from '@/components/buttons/Button'
import CloseBtn from '@/components/buttons/CloseButton'
import RandomManhwaButton from '@/components/buttons/OpenRandomManhwaButton'
import ResetAppButton from '@/components/buttons/ResetAppButton'
import UpdateDatabaseButton from '@/components/buttons/UpdateDatabaseButton'
import CollectionGrid from '@/components/grid/CollectionsGrid'
import ContinueReadingGrid from '@/components/grid/ContinueReadingGrid'
import GenreGrid from '@/components/grid/GenreGrid'
import LatestUpdatesGrid from '@/components/grid/LatestUpdatesGrid'
import ManhwaHorizontalGrid from '@/components/grid/ManhwaHorizontalGrid'
import MostPopularGrid from '@/components/grid/MostPopularGrid'
import RandomCardsGrid from '@/components/grid/RandomCardsGrid'
import Top10Grid from '@/components/grid/Top10Grid'
import LateralMenu from '@/components/LateralMenu'
import TopBar from '@/components/TopBar'
import Column from '@/components/util/Column'
import Footer from '@/components/util/Footer'
import AppLogo from '@/components/util/Logo'
import Row from '@/components/util/Row'
import { AppConstants } from '@/constants/AppConstants'
import { Colors } from '@/constants/Colors'
import { Typography } from '@/constants/typography'
import { Collection, Genre, Manhwa } from '@/helpers/types'
import { hp, wp } from '@/helpers/util'
import { 
    dbCleanTable, 
    dbGetReadingHistory, 
    dbIsChapterMilestoneReached, 
    dbReadCollections, 
    dbReadGenres, 
    dbReadManhwasOrderedByUpdateAt, 
    dbReadManhwasOrderedByViews, 
    dbSetShouldAskForDonation, 
    dbShouldUpdate, 
    dbUpsertCollections 
} from '@/lib/database'
import { 
    spFetchCollections, 
    spFetchLiveVersion, 
    spFetchRandomManhwaCards, 
    spGetTodayTop10 
} from '@/lib/supabase'
import { useAppVersionState } from '@/store/appVersionState'
import { useManhwaCardsState } from '@/store/randomManhwaState'
import { useTop10ManhwasState } from '@/store/top10State'
import { AppStyle } from '@/styles/AppStyle'
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet'
import { router, useFocusEffect } from 'expo-router'
import { useSQLiteContext } from 'expo-sqlite'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { 
    Animated, 
    Pressable, 
    Text, 
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

    const bottomSheetRef = useRef<BottomSheet>(null);
    const newReleaseBottomSheetRef = useRef<BottomSheet>(null)
    
    const { cards, setCards } = useManhwaCardsState()
    const { localVersion } = useAppVersionState()    
    
    const shouldShowNewAppVersionWarning = useAppVersionState(s => s.shouldShowNewAppVersionWarning)
    const setShouldShowNewAppVersionWarning = useAppVersionState(s => s.setShouldShowNewAppVersionWarning)
    
    const { top10manhwas, setTop10manhwas } = useTop10ManhwasState()
    const [collections, setCollections] = useState<Collection[]>([])
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
        let c = await dbReadCollections(db)
        const shouldUpdate = await dbShouldUpdate(db, 'collections')
        if (c.length === 0 || shouldUpdate) {
            c = await spFetchCollections()
            await dbCleanTable(db, 'collections')
            await dbUpsertCollections(db, c)
        }
        setCollections(c)
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

    const updateLiveVersion = async () => {
        const l = await spFetchLiveVersion()
        if (
            l !== null && 
            l != localVersion && 
            shouldShowNewAppVersionWarning
        ) {
            newReleaseBottomSheetRef.current?.expand()
        }
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
                    updateRandomCards(),
                    updateLiveVersion()
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
                    await dbIsChapterMilestoneReached(db)
                        .then(s => s ? handleOpenDonationBottomSheet() : null)
                    await dbGetReadingHistory(db, 0, PAGE_LIMIT)
                        .then(v => setReadingHistoryManhwas(v))
                }
                reload()
            },
            []
        )
    )

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

    const handleOpenDonationBottomSheet = useCallback(() => {
        bottomSheetRef.current?.expand();
    }, []);

    const handleCloseDonationBottomSheet = useCallback(() => {
        bottomSheetRef.current?.close();        
    }, []);

    const handleCloseNewReleaseBottomSheet = useCallback(() => {
        newReleaseBottomSheetRef.current?.close();        
    }, []);

    const neverShowDonationMessageAgain =  async () => {
        await dbSetShouldAskForDonation(db, '0')
        handleCloseDonationBottomSheet()
    }

    const openDonatePage = () => {
        handleCloseDonationBottomSheet()
        router.navigate("/(pages)/DonatePage")
    }

    const openReleasesPage = () => {
        handleCloseNewReleaseBottomSheet
        router.navigate("/(pages)/ReleasesPage")
    }

    const dismissNewAppVersionWarning = () => {
        setShouldShowNewAppVersionWarning(false)
        handleCloseNewReleaseBottomSheet()
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

            {/* New App Release Warning */}
            <BottomSheet
                ref={newReleaseBottomSheetRef}
                index={-1}
                handleIndicatorStyle={styles.handleIndicatorStyle}
                handleStyle={styles.handleStyle}
                backgroundStyle={styles.bottomSheetBackgroundStyle}
                enablePanDownToClose={true}>
                <BottomSheetView style={styles.bottomSheetContainer} >
                    <TopBar title='New version available!'>
                        <CloseBtn onPress={handleCloseNewReleaseBottomSheet}/>
                    </TopBar>
                    <Row style={{gap: 10}} >
                        <Pressable onPress={handleCloseNewReleaseBottomSheet} style={AppStyle.buttonCancel} >
                            <Text style={[Typography.regular, {color: Colors.yellow}]} >Close</Text>
                        </Pressable>
                        <Pressable onPress={openReleasesPage} style={AppStyle.button} >
                            <Text style={[Typography.regular, {color: Colors.backgroundColor}]} >Update!</Text>
                        </Pressable>
                    </Row>
                    <Pressable onPress={dismissNewAppVersionWarning} >
                        <Text style={styles.textLink}>Dismiss for now</Text>
                    </Pressable>
                    <Footer height={80}/>
                </BottomSheetView>
            </BottomSheet>

            {/* Ask For Donation BottomSheet */}
            <BottomSheet
                ref={bottomSheetRef}
                index={-1}
                handleIndicatorStyle={styles.handleIndicatorStyle}
                handleStyle={styles.handleStyle}
                backgroundStyle={styles.bottomSheetBackgroundStyle}
                enablePanDownToClose={true}>
                <BottomSheetView style={styles.bottomSheetContainer} >
                    <TopBar title={AppConstants.DONATION.BOTTOMSHEET.TITLE}>
                        <CloseBtn onPress={handleCloseDonationBottomSheet}/>
                    </TopBar>
                    <Text style={Typography.regular}>{AppConstants.DONATION.BOTTOMSHEET.MESSAGE}</Text>
                    <Row style={{gap: 10}} >
                        <Pressable onPress={handleCloseDonationBottomSheet} style={AppStyle.buttonCancel} >
                            <Text style={[Typography.regular, {color: Colors.yellow}]} >Close</Text>
                        </Pressable>
                        <Pressable onPress={openDonatePage} style={AppStyle.button} >
                            <Text style={[Typography.regular, {color: Colors.backgroundSecondary}]} >Donate</Text>
                        </Pressable>
                    </Row>
                    <Pressable onPress={neverShowDonationMessageAgain} hitSlop={AppConstants.COMMON.HIT_SLOP.LARGE} >
                        <Text style={styles.textLink}>Never show again.</Text>
                    </Pressable>
                    <Footer height={80}/>
                </BottomSheetView>
            </BottomSheet>

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