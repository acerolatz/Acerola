import ReturnButton from '@/components/buttons/ReturnButton'
import ManhwaGrid from '@/components/grid/ManhwaGrid'
import TopBar from '@/components/TopBar'
import { Colors } from '@/constants/Colors'
import { Manhwa } from '@/helpers/types'
import { dbReadManhwasByAuthorId } from '@/lib/database'
import { AppStyle } from '@/styles/AppStyle'
import { useLocalSearchParams } from 'expo-router'
import { useSQLiteContext } from 'expo-sqlite'
import React, { useEffect, useState } from 'react'
import { SafeAreaView } from 'react-native'


const ManhwaByAuthor = () => {
  
    const db = useSQLiteContext()
    const params = useLocalSearchParams()
    const author_id: number = parseInt(params.author_id as any)
    const author_name: string = params.author_name as any
    const author_role: string = params.author_role as any
    
    const [manhwas, setManhwas] = useState<Manhwa[]>([])
    const [loading, setLoading] = useState(false)
    
    useEffect(
        () => {
            async function init() {
                if (manhwas.length === 0) {
                    setLoading(true)
                    await dbReadManhwasByAuthorId(db, author_id)
                        .then(values => setManhwas([...values]))
                        .catch(e => setManhwas([]))
                    setLoading(false)
                }
            }
            init()
        },
        [db, manhwas, author_id]
    )    

    return (
        <SafeAreaView style={AppStyle.safeArea}>
            <TopBar title={`${author_role}: ${author_name}`} titleColor={Colors.orange} >
                <ReturnButton color={Colors.orange} />
            </TopBar>
            <ManhwaGrid
                manhwas={manhwas}
                numColumns={2}
                loading={loading}
                hasResults={true}
                listMode='FlatList'
                showChaptersPreview={false}/>
        </SafeAreaView>
  )
}


export default ManhwaByAuthor
