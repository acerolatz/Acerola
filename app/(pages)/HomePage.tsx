import Button from '@/components/buttons/Button'
import OpenRandomManhwaButton from '@/components/buttons/OpenRandomManhwaButton'
import UpdateDatabaseButton from '@/components/buttons/UpdateDatabaseButton'
import CollectionGrid from '@/components/grid/CollectionsGrid'
import ContinueReadingGrid from '@/components/grid/ContinueReadingGrid'
import GenreGrid from '@/components/grid/GenreGrid'
import ManhwaHorizontalGrid from '@/components/grid/ManhwaHorizontalGrid'
import RandomCardsGrid from '@/components/grid/RandomCardsGrid'
import Top10Grid from '@/components/grid/Top10Grid'
import LateralMenu from '@/components/LateralMenu'
import AppLogo from '@/components/util/Logo'
import Row from '@/components/util/Row'
import { AppConstants } from '@/constants/AppConstants'
import { Colors } from '@/constants/Colors'
import { Collection, Genre, Manhwa } from '@/helpers/types'
import { hp, wp } from '@/helpers/util'
import { dbCleanTable, dbGetReadingHistory, dbGetTopDaily10Manhwas, dbReadCollections, dbReadGenres, dbReadManhwasOrderedByUpdateAt, dbReadManhwasOrderedByViews, dbShouldUpdate, dbUpsertCollections } from '@/lib/database'
import { spFetchCollections, spFetchRandomManhwaCards, spGetTodayTop10 } from '@/lib/supabase'
import { useManhwaCardsState } from '@/store/randomManhwaState'
import { AppStyle } from '@/styles/AppStyle'
import { router, useFocusEffect } from 'expo-router'
import { useSQLiteContext } from 'expo-sqlite'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { Animated, Pressable, SafeAreaView, ScrollView, StyleSheet, View } from 'react-native'


const SCREEN_WIDTH = wp(100)
const SCREEN_HEIGHT = hp(100)


const HomePage = () => {

    const menuAnim = useRef(new Animated.Value(-AppConstants.PAGES.HOME.MENU_WIDTH)).current 
    const backgroundAnim = useRef(new Animated.Value(-SCREEN_WIDTH)).current
    const menuVisible = useRef(false)
    
    const db = useSQLiteContext()
    
    const { cards, setCards } = useManhwaCardsState()
    
    const [top10Manhwas, setTop10Manhwas] = useState<Manhwa[]>([])
    const [collections, setCollections] = useState<Collection[]>([])
    const [loading, setLoading] = useState(true)
    const [genres, setGenres] = useState<Genre[]>([])
    const [latestUpdate, setLatestUpdates] = useState<Manhwa[]>([])
    const [mostView, setMostView] = useState<Manhwa[]>([])    
    const [readingHistoryManhwas, setReadingHistoryManhwas] = useState<Manhwa[]>([])

    const reloadCards = async () => {
        const r = await spFetchRandomManhwaCards(32)
        setCards(r)
    }
    
    useEffect(
        () => {
            let isCancelled = false
            const init = async () => {
                setLoading(true)

                    const g = genres.length === 0 ? await dbReadGenres(db) : null
                    const l = latestUpdate.length === 0 ? await dbReadManhwasOrderedByUpdateAt(db, 0, 30) : null
                    const m = mostView.length === 0 ? await dbReadManhwasOrderedByViews(db, 0, 30) : null
                    const top10 = top10Manhwas.length === 0 ? await dbGetTopDaily10Manhwas(db) : null
                    
                    if (isCancelled) { return }
                    if (g) { setGenres(g) }
                    if (l) { setLatestUpdates(l) }
                    if (m) { setMostView(m) }
                    if (top10) { setTop10Manhwas(top10) }

                    if (collections.length == 0) {
                        let c = await dbReadCollections(db)
                        const shouldUpdateCollections = await dbShouldUpdate(db, 'collections')
                        if (c.length == 0 || shouldUpdateCollections) {
                            c = await spFetchCollections()
                            if (isCancelled) { return }
                            await dbCleanTable(db, 'collections')
                            await dbUpsertCollections(db, c)
                        }
                        setCollections(c)
                    }

                setLoading(false)             

                if (cards.length == 0) {
                    const r = await spFetchRandomManhwaCards(30)
                    if (isCancelled) { return }
                    setCards(r)
                }                
            }

            init()
            return () => { isCancelled = true }
        },
        [db]
    )    

    useFocusEffect(
        useCallback(
            () => {
                const reload = async () => {
                    const h = await dbGetReadingHistory(db, 0, 32)
                    setReadingHistoryManhwas(h)
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
            useNativeDriver: false
        }).start(() => {
            menuVisible.current = true
        })
        Animated.timing(backgroundAnim, {
            toValue: 0,
            duration: AppConstants.PAGES.HOME.MENU_ANIMATION_TIME * 1.2,
            useNativeDriver: false
        }).start(() => {})
    }

    const closeMenu = () => {
        Animated.timing(menuAnim, {
            toValue: -AppConstants.PAGES.HOME.MENU_WIDTH,
            duration: AppConstants.PAGES.HOME.MENU_ANIMATION_TIME,
            useNativeDriver: false
        }).start(() => {
            menuVisible.current = false
        })
        Animated.timing(backgroundAnim, {
            toValue: -SCREEN_WIDTH,
            duration: AppConstants.PAGES.HOME.MENU_ANIMATION_TIME,
            useNativeDriver: false
        }).start(() => {})
    }  

    const searchPress = () => {
        router.navigate("/(pages)/ManhwaSearch")
    }

    const toggleMenu = () => {
        menuVisible.current ? closeMenu() : openMenu()
    }

    return (
        <SafeAreaView style={AppStyle.safeArea} >            
            {/* Header */}
            <Row style={{width: '100%', paddingRight: 2, marginTop: 4, marginBottom: 10, justifyContent: "space-between"}} >
                <AppLogo/>
                    <Row style={{gap: 10}} >
                        {
                            !loading &&
                            <>
                                <UpdateDatabaseButton iconColor={Colors.white} type='client' />
                                <Button iconName='search-outline' onPress={searchPress} iconSize={28} iconColor={Colors.white} showLoading={false} />
                                <OpenRandomManhwaButton color={Colors.white} size={28} backgroundColor='' />
                            </>
                        }
                        <Button iconName='options-outline' onPress={toggleMenu} iconSize={28} iconColor={Colors.white} showLoading={false} />                        
                    </Row>
            </Row>

            {/* Main content */}
            <ScrollView style={{flex: 1}} showsVerticalScrollIndicator={false} >
                <View style={{gap: 14}} >
                    <GenreGrid genres={genres} />
                    <CollectionGrid collections={collections} />
                    <ContinueReadingGrid manhwas={readingHistoryManhwas} />
                    <Top10Grid manhwas={top10Manhwas} />
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
                    <RandomCardsGrid reloadCards={reloadCards} />
                    <View style={{width: '100%', height: 20}} />
                </View>
            </ScrollView>

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
    }
})