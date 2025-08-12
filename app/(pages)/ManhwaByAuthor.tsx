import ReturnButton from '@/components/buttons/ReturnButton'
import ManhwaGrid from '@/components/grid/ManhwaGrid'
import TopBar from '@/components/TopBar'
import { Colors } from '@/constants/Colors'
import { Manhwa } from '@/helpers/types'
import { dbReadManhwasByAuthorId } from '@/lib/database'
import { AppStyle } from '@/styles/AppStyle'
import { useLocalSearchParams } from 'expo-router'
import { useSQLiteContext } from 'expo-sqlite'
import React, { useEffect, useRef, useState } from 'react'
import { SafeAreaView } from 'react-native'


const ManhwaByAuthor = () => {
  
    const db = useSQLiteContext()
    const params = useLocalSearchParams()
    const author_id: number = parseInt(params.author_id as any)
    const author_name: string = params.author_name as any
    const author_role: string = params.author_role as any
    const t = author_role == "Author" ? "Story" : "Art"
    
    const [manhwas, setManhwas] = useState<Manhwa[]>([])
    const [loading, setLoading] = useState(false)

    const isInitialized = useRef(false)
    
    useEffect(
        () => {
            let isCancelled = false
            if (isInitialized.current) { return }
            isInitialized.current = true
            async function init() {
                setLoading(true)
                    const m = await dbReadManhwasByAuthorId(db, author_id)
                    if (isCancelled) { return }
                    setManhwas(m)
                setLoading(false)
            }
            init()
            return () => { isCancelled = true }
        },
        [db]
    )    

    return (
        <SafeAreaView style={AppStyle.safeArea}>
            <TopBar title={`${t}: ${author_name}`} titleColor={Colors.yellow} >
                <ReturnButton color={Colors.yellow} />
            </TopBar>
            <ManhwaGrid
                manhwas={manhwas}
                numColumns={2}
                loading={loading}
                showChaptersPreview={false}
            />
        </SafeAreaView>
  )
}


export default ManhwaByAuthor
