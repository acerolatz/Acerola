import { FlatList, StyleSheet, View } from 'react-native'
import { AppConstants } from '@/constants/AppConstants'
import ViewAllButton from '../buttons/ViewAllButton'
import React, { useCallback } from 'react'
import { Manhwa } from '@/helpers/types'
import ManhwaCard from '../ManhwaCard'
import Row from '../util/Row'
import Title from '../Title'


interface ManhwaHorizontalGridProps {    
    title: string
    manhwas: Manhwa[]
    onViewAll: () => void    
}


const ManhwaHorizontalGrid = ({
    title,
    manhwas,
    onViewAll    
}: ManhwaHorizontalGridProps) => {

    const keyExtractor = useCallback((item: Manhwa) => item.manhwa_id.toString(), [])

    const renderItem = useCallback(({item}: {item: Manhwa}) => (
        <ManhwaCard manhwa={item} />
      ), [])
    
    if (manhwas.length === 0)  { return <></> }
    
    return (
        <View style={styles.container} >
            <Row style={styles.header} >
                <Title title={title}/>
                <ViewAllButton onPress={onViewAll} />
            </Row>            
            <FlatList
                data={manhwas}
                horizontal={true}
                windowSize={5}
                maxToRenderPerBatch={7}
                updateCellsBatchingPeriod={50}
                initialNumToRender={10}
                keyExtractor={keyExtractor}
                renderItem={renderItem}
                showsHorizontalScrollIndicator={false}
            />
        </View>
    )
}

export default ManhwaHorizontalGrid

const styles = StyleSheet.create({
    container: {
        width: '100%',
        gap: AppConstants.GAP
    },
    header: {
        width: '100%', 
        justifyContent: "space-between"
    }
})