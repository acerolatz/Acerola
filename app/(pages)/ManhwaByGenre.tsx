import React, { useCallback, useEffect, useRef, useState } from 'react'
import ReturnButton from '@/app/components/buttons/ReturnButton'
import { AppConstants } from '@/constants/AppConstants'
import { dbReadManhwasByGenreId } from '@/lib/database'
import ManhwaGrid from '@/app/components/grid/ManhwaGrid'
import { useLocalSearchParams } from 'expo-router'
import { AppStyle } from '@/styles/AppStyle'
import { useSQLiteContext } from 'expo-sqlite'
import { Manhwa } from '@/helpers/types'
import { SafeAreaView } from 'react-native'
import TopBar from '@/app/components/TopBar'


const MangaByGenre = () => {
    
    const db = useSQLiteContext()
    const params = useLocalSearchParams()
    const genre: string = params.genre as any
    const genre_id: number = parseInt(params.genre_id as any)

    const [manhwas, setManhwas] = useState<Manhwa[]>([])
    
    const manhwasRef = useRef<Manhwa[]>([])
    const fetching = useRef(false)
    const hasResults = useRef(true)
    const isMounted = useRef(true)
    const page = useRef(0)

    useEffect(
        () => {
            isMounted.current = true
            async function init() {            
                const m = await dbReadManhwasByGenreId(db, genre_id, 0, AppConstants.VALIDATION.PAGE_LIMIT)
                if (!isMounted.current) { return }
                setManhwas(m)
                manhwasRef.current = m
                hasResults.current = m.length >= AppConstants.VALIDATION.PAGE_LIMIT
            }
            init()
            return () => { isMounted.current = false }
        },
        [db, genre_id]
    )

    const onEndReached = useCallback(async () => {
        if (fetching.current || !hasResults.current) { return }
        fetching.current = true
        page.current += 1
        const m = await dbReadManhwasByGenreId(
            db,
            genre_id,
            AppConstants.VALIDATION.PAGE_LIMIT * page.current,
            AppConstants.VALIDATION.PAGE_LIMIT
        )
        if (isMounted.current && m.length) {
            manhwasRef.current.push(...m)
            setManhwas([...manhwasRef.current])
            hasResults.current = m.length >= AppConstants.VALIDATION.PAGE_LIMIT
        }
        fetching.current = false
    }, [genre_id])

    return (
        <SafeAreaView style={AppStyle.safeArea}>
            <TopBar title={genre} >
                <ReturnButton/>
            </TopBar>
            <ManhwaGrid manhwas={manhwas} onEndReached={onEndReached}/>            
        </SafeAreaView>
    )
}


export default MangaByGenre
