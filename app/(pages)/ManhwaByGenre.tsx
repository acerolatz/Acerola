import ReturnButton from '@/components/buttons/ReturnButton'
import React, { useEffect, useRef, useState } from 'react'
import { dbReadManhwasByGenreId } from '@/lib/database'
import { AppConstants } from '@/constants/AppConstants'
import ManhwaGrid from '@/components/grid/ManhwaGrid'
import { useLocalSearchParams } from 'expo-router'
import { useSQLiteContext } from 'expo-sqlite'
import { AppStyle } from '@/styles/AppStyle'
import { SafeAreaView } from 'react-native'
import TopBar from '@/components/TopBar'
import { Manhwa } from '@/helpers/types'


const MangaByGenre = () => {
    
    const db = useSQLiteContext()
    const params = useLocalSearchParams()
    const genre: string = params.genre as any
    const genre_id: number = parseInt(params.genre_id as any)

    const [manhwas, setManhwas] = useState<Manhwa[]>([])
    const [loading, setLoading] = useState(false)
    
    const fetchingOnEndReached = useRef(false)
    const hasResults = useRef(true)
    const page = useRef(0)
    
    const isInitialized = useRef(false)

    useEffect(
        () => {
            async function init() {
                setLoading(true)
                    const m = await dbReadManhwasByGenreId(db, genre_id, 0, AppConstants.PAGE_LIMIT)
                    setManhwas(m)
                    hasResults.current = m.length >= AppConstants.PAGE_LIMIT
                    isInitialized.current = true
                setLoading(false)
            }
            init()
        },
        [db, genre_id]
    )

    const onEndReached = async () => {
        if (
            fetchingOnEndReached.current ||
            !hasResults.current || 
            !isInitialized.current
        ) { return }
        fetchingOnEndReached.current = true
        page.current += 1
        setLoading(true)
            const m = await dbReadManhwasByGenreId(
                db, 
                genre_id, 
                page.current * AppConstants.PAGE_LIMIT, 
                AppConstants.PAGE_LIMIT
            )
            setManhwas(prev => [...prev, ...m])
            hasResults.current = m.length >= AppConstants.PAGE_LIMIT
            fetchingOnEndReached.current = false
        setLoading(false)
    }  

    return (
        <SafeAreaView style={AppStyle.safeArea}>
            <TopBar title={genre} >
                <ReturnButton/>
            </TopBar>
            <ManhwaGrid
                manhwas={manhwas}
                loading={loading}
                hasResults={hasResults.current}                                
                showChaptersPreview={false}
                onEndReached={onEndReached}/>
        </SafeAreaView>
    )
}


export default MangaByGenre

