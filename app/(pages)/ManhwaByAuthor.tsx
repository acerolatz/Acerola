import ReturnButton from '@/components/buttons/ReturnButton'
import React, { useEffect, useRef, useState } from 'react'
import { dbReadManhwasByAuthorId } from '@/lib/database'
import ManhwaGrid from '@/components/grid/ManhwaGrid'
import { useLocalSearchParams } from 'expo-router'
import { useSQLiteContext } from 'expo-sqlite'
import { AppStyle } from '@/styles/AppStyle'
import { SafeAreaView } from 'react-native'
import TopBar from '@/components/TopBar'
import { Manhwa } from '@/helpers/types'


const ManhwaByAuthor = () => {
  
    const db = useSQLiteContext()
    const params = useLocalSearchParams()
    const author_id: number = parseInt(params.author_id as any)
    const author_name: string = params.author_name as any
    const author_role: string = params.author_role as any
    const t = author_role == "Author" ? "Story" : "Art"
    
    const [manhwas, setManhwas] = useState<Manhwa[]>([])

    const isMounted = useRef(true)
    
    useEffect(
        () => {
            isMounted.current = true
            async function init() {
                const m = await dbReadManhwasByAuthorId(db, author_id)
                if (!isMounted.current) { return }
                setManhwas(m)
            }
            init()
            return () => { isMounted.current = false }
        },
        [db]
    )

    return (
        <SafeAreaView style={AppStyle.safeArea}>
            <TopBar title={`${t}: ${author_name}`} >
                <ReturnButton/>
            </TopBar>
            <ManhwaGrid manhwas={manhwas} />
        </SafeAreaView>
  )
}


export default ManhwaByAuthor
