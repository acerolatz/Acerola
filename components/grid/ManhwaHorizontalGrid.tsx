import { AppConstants } from '@/constants/AppConstants'
import { Manhwa } from '@/helpers/types'
import { wp } from '@/helpers/util'
import { FlashList } from '@shopify/flash-list'
import { SQLiteDatabase, useSQLiteContext } from 'expo-sqlite'
import React, { useEffect, useState } from 'react'
import { StyleSheet, View } from 'react-native'
import ManhwaCard from '../ManhwaCard'
import Title from '../Title'
import ViewAllButton from '../buttons/ViewAllButton'
import Row from '../util/Row'


interface ManhwaHorizontalGridProps {    
    title: string
    iconName: string
    fetchFunction: (db: SQLiteDatabase, p_offset: number, p_limit: number) => Promise<Manhwa[]>
    onViewAll: () => void
}


const ManhwaHorizontalGrid = ({
    title, 
    iconName, 
    fetchFunction, 
    onViewAll
}: ManhwaHorizontalGridProps) => {

    const db = useSQLiteContext()
    const [manhwas, setManhwas] = useState<Manhwa[]>([])
    
    useEffect(
        () => {
            async function init() {
                await fetchFunction(db, 0, 30).then(v => setManhwas(v))
            }
            init()
        },
        [db]
    )    

    return (
        <View style={styles.container} >
            <Row style={{width: '100%', justifyContent: "space-between"}} >
                <Title title={title} iconName={iconName}/>
                <ViewAllButton onPress={onViewAll} />
            </Row>
            <View style={styles.flashListContainer}>
                <FlashList
                    data={manhwas}
                    horizontal={true}
                    onEndReachedThreshold={2}
                    estimatedItemSize={wp(80)}
                    drawDistance={wp(200)}
                    keyExtractor={(item: Manhwa) => item.manhwa_id.toString()}
                    renderItem={({item}) => <ManhwaCard manhwa={item} marginRight={4} />}
                />
            </View>
        </View>
    )
}

export default ManhwaHorizontalGrid

const styles = StyleSheet.create({
    container: {
        width: '100%',
        gap: 10
    },
    flashListContainer: {
        alignItems: 'flex-start', 
        height: AppConstants.MANHWA_COVER_DIMENSION.height + 180, 
        width: '100%'        
    }
})