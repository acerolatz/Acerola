import { AppConstants } from '@/constants/AppConstants'
import { Manhwa } from '@/helpers/types'
import { hp, wp } from '@/helpers/util'
import { FlashList } from '@shopify/flash-list'
import React from 'react'
import { FlatList, StyleSheet, View } from 'react-native'
import ManhwaCard from '../ManhwaCard'
import Title from '../Title'
import ViewAllButton from '../buttons/ViewAllButton'
import Row from '../util/Row'
import { useSettingsState } from '@/store/settingsState'


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
    
    const { settings } = useSettingsState()

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
                    keyExtractor={(item: Manhwa) => item.manhwa_id.toString()}
                    extraData={settings.showLast3Chapters}
                    renderItem={
                        ({item}) => <ManhwaCard manhwa={item} showChaptersPreview={settings.showLast3Chapters} />
                    }
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