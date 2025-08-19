import { FlatList, StyleSheet, View } from 'react-native'
import { useSettingsState } from '@/store/settingsState'
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
    
    const showLast3Chapters = useSettingsState(s => s.settings.showLast3Chapters)    

    const keyExtractor = useCallback((item: Manhwa) => item.manhwa_id.toString(), [])

    const renderItem = useCallback(({item}: {item: Manhwa}) => (
        <ManhwaCard manhwa={item} showChaptersPreview={showLast3Chapters} />
      ), [])
    
    if (manhwas.length === 0)  { return <></> }
    
    return (
        <View style={styles.container} >
            <Row style={styles.header} >
                <Title title={title}/>
                <ViewAllButton onPress={onViewAll} />
            </Row>
            <View style={{width: '100%'}} >
                <FlatList
                    data={manhwas}
                    horizontal={true}
                    initialNumToRender={10}
                    showsHorizontalScrollIndicator={false}
                    keyExtractor={keyExtractor}
                    extraData={showLast3Chapters}
                    renderItem={renderItem}
                />
            </View>
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