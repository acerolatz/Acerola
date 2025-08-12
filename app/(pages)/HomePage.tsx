import Button from '@/components/buttons/Button'
import RandomManhwaButton from '@/components/buttons/OpenRandomManhwaButton'
import UpdateDatabaseButton from '@/components/buttons/UpdateDatabaseButton'
import CollectionGrid from '@/components/grid/CollectionsGrid'
import ContinueReadingGrid from '@/components/grid/ContinueReadingGrid'
import GenreGrid from '@/components/grid/GenreGrid'
import ManhwaHorizontalGrid from '@/components/grid/ManhwaHorizontalGrid'
import RandomCardsGrid from '@/components/grid/RandomCardsGrid'
import Top10Grid from '@/components/grid/Top10Grid'
import LateralMenu from '@/components/LateralMenu'
import TopBar from '@/components/TopBar'
import Footer from '@/components/util/Footer'
import AppLogo from '@/components/util/Logo'
import Row from '@/components/util/Row'
import { AppConstants } from '@/constants/AppConstants'
import { Colors } from '@/constants/Colors'
import { Collection, Genre, Manhwa } from '@/helpers/types'
import { hp, wp } from '@/helpers/util'
import { dbCleanTable, dbGetReadingHistory, dbIsChapterMilestoneReached, dbGetReadChaptersCount, dbReadCollections, dbReadGenres, dbReadManhwasOrderedByUpdateAt, dbReadManhwasOrderedByViews, dbSetShouldAskForDonation, dbShouldUpdate, dbUpsertCollections } from '@/lib/database'
import { spFetchCollections, spFetchRandomManhwaCards, spGetTodayTop10 } from '@/lib/supabase'
import { useManhwaCardsState } from '@/store/randomManhwaState'
import { useTop10ManhwasState } from '@/store/top10State'
import { AppStyle } from '@/styles/AppStyle'
import Ionicons from '@expo/vector-icons/Ionicons'
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet'
import { router, useFocusEffect } from 'expo-router'
import { useSQLiteContext } from 'expo-sqlite'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Animated, Pressable, Text, SafeAreaView, ScrollView, StyleSheet, View } from 'react-native'


const SCREEN_WIDTH = wp(100)
const SCREEN_HEIGHT = hp(100)

const PAGE_LIMIT = 32

const HomePage = () => {

    const menuAnim = useRef(new Animated.Value(-AppConstants.PAGES.HOME.MENU_WIDTH)).current 
    const backgroundAnim = useRef(new Animated.Value(-SCREEN_WIDTH)).current
    const menuVisible = useRef(false)
    
    const db = useSQLiteContext()
    const initDone = useRef(false)      
    const bottomSheetRef = useRef<BottomSheet>(null);
    
    const { cards, setCards } = useManhwaCardsState()
    
    const { top10manhwas, setTop10manhwas } = useTop10ManhwasState()
    const [collections, setCollections] = useState<Collection[]>([])
    const [loading, setLoading] = useState(true)
    const [genres, setGenres] = useState<Genre[]>([])
    const [latestUpdate, setLatestUpdates] = useState<Manhwa[]>([])
    const [mostView, setMostView] = useState<Manhwa[]>([])    
    const [readingHistoryManhwas, setReadingHistoryManhwas] = useState<Manhwa[]>([])

    const reloadCards = async () => {
        const r = await spFetchRandomManhwaCards(PAGE_LIMIT)
        setCards(r)
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

    const updateRandomCards = async () => {
        if (cards.length == 0) {
            const r = await spFetchRandomManhwaCards(PAGE_LIMIT)
            setCards(r)
        }
    }
    
    useEffect(
        () => {
            if (initDone.current) { return }
            const init = async () => {
                initDone.current = true

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
                    await dbIsChapterMilestoneReached(db)
                        .then(s => s ? handleOpenBottomSheet() : null)
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
            toValue: -SCREEN_WIDTH,
            duration: AppConstants.PAGES.HOME.MENU_ANIMATION_TIME,
            useNativeDriver: true
        }).start()
    }

    const searchPress = () => {
        router.navigate("/(pages)/ManhwaSearch")
    }

    const toggleMenu = () => {
        menuVisible.current ? closeMenu() : openMenu()
    }

    const handleOpenBottomSheet = useCallback(() => {
        bottomSheetRef.current?.expand();
    }, []);

    const handleCloseBottomSheet = useCallback(() => {
        bottomSheetRef.current?.close();
    }, []);

    const neverShowDonationMessageAgain =  async () => {
        await dbSetShouldAskForDonation(db, '0')
        handleCloseBottomSheet()
    }

    const openDonate = () => {
        handleCloseBottomSheet()
        router.navigate("/(pages)/DonatePage")
    }

    return (
        <SafeAreaView style={AppStyle.safeArea} >            
            {/* Header */}
            <Row style={{width: '100%', paddingRight: 2, marginTop: 4, marginBottom: 10, justifyContent: "space-between"}} >
                <AppLogo/>
                <Row style={{gap: 20}} >
                    {
                        !loading &&
                        <>
                            <UpdateDatabaseButton type='client' />
                            <Button iconName='search-outline' onPress={searchPress} showLoading={false} />
                            <RandomManhwaButton backgroundColor='transparent' />
                        </>
                    }
                    <Button iconName='options-outline' onPress={toggleMenu} iconSize={22} iconColor={Colors.white} showLoading={false} />
                </Row>
            </Row>

            {/* Main content */}
            <ScrollView style={{flex: 1}} showsVerticalScrollIndicator={false} >
                <View style={{gap: 12}} >
                    <GenreGrid genres={genres} />
                    <CollectionGrid collections={collections} />
                    <ContinueReadingGrid manhwas={readingHistoryManhwas} />
                    <Top10Grid manhwas={top10manhwas} />
                    <ManhwaHorizontalGrid
                        title='Latest Updates'
                        onViewAll={() => router.navigate("/(pages)/LatestUpdatesPage")}
                        manhwas={latestUpdate}
                    />
                    <ManhwaHorizontalGrid
                        title='Most Popular'
                        onViewAll={() => router.navigate("/(pages)/MostViewPage")}
                        manhwas={mostView}
                    />
                    { !loading && <RandomCardsGrid reloadCards={reloadCards} /> }
                    <View style={{width: '100%', height: 20}} />
                </View>
            </ScrollView>

            <BottomSheet
                ref={bottomSheetRef}
                index={-1}
                handleIndicatorStyle={{backgroundColor: Colors.donateColor}}
                handleStyle={{backgroundColor: Colors.backgroundSecondary, borderRadius: 20}}
                backgroundStyle={{backgroundColor: Colors.backgroundSecondary}}
                
                enablePanDownToClose={true}
            >
                <BottomSheetView style={{paddingHorizontal: wp(4), gap: 10}} >
                    <TopBar title='Enjoying the app?' titleColor={Colors.donateColor}>
                        <Pressable onPress={handleCloseBottomSheet} >
                            <Ionicons name='close-circle-outline' color={Colors.donateColor} size={22} />
                        </Pressable>
                    </TopBar>
                    <Text style={[AppStyle.textRegular, {}]}>Consider making a donation to help keep the servers running.</Text>
                    <Row style={{gap: 10}} >
                        <Pressable onPress={handleCloseBottomSheet} style={[styles.button, {backgroundColor: Colors.backgroundSecondary, borderWidth: 1, borderColor: Colors.donateColor}]} >
                            <Text style={[AppStyle.textRegular, {color: Colors.donateColor}]} >Close</Text>
                        </Pressable>
                        <Pressable onPress={openDonate} style={styles.button} >
                            <Text style={[AppStyle.textRegular, {color: Colors.backgroundSecondary}]} >Donate</Text>
                        </Pressable>
                    </Row>
                    <Pressable onPress={neverShowDonationMessageAgain} >
                        <Text style={[AppStyle.textRegular, {fontSize: 16, textDecorationLine: 'underline'}]}>Never show again.</Text>
                    </Pressable>
                    <Footer/>
                </BottomSheetView>
            </BottomSheet>

            {/* Lateral Menu */}
            <Animated.View style={[styles.menuBackground, { width: SCREEN_WIDTH, transform: [{ translateX: backgroundAnim }] }]}>
                <Pressable onPress={closeMenu} style={{width: '100%', height: '100%'}} />
            </Animated.View>
            <Animated.View style={[styles.sideMenu, { width: AppConstants.PAGES.HOME.MENU_WIDTH, transform: [{ translateX: menuAnim }] }]}>
                <LateralMenu closeMenu={closeMenu}/>
            </Animated.View>
        </SafeAreaView>
    )
}


export default HomePage


const styles = StyleSheet.create({
    sideMenu: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 0,        
        backgroundColor: Colors.backgroundColor,
        elevation: 5,        
        zIndex: 100
    },
    menuBackground: {
        position: 'absolute',
        width: SCREEN_WIDTH,
        height: SCREEN_HEIGHT * 1.2,
        top: 0,
        left: 0,        
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        elevation: 4,        
        zIndex: 90
    },
    button: {
        borderRadius: AppConstants.COMMON.BORDER_RADIUS,
        backgroundColor: Colors.donateColor,
        alignItems: "center",
        justifyContent: "center",
        flex: 1,
        height: 52
    }
})