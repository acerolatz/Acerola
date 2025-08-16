import { AppConstants } from '@/constants/AppConstants'
import { Manhwa } from '@/helpers/types'
import { hp, wp } from '@/helpers/util'
import { FlashList } from '@shopify/flash-list'
import React from 'react'
import { StyleSheet, View } from 'react-native'
import ManhwaCard from '../ManhwaCard'
import Title from '../Title'
import ViewAllButton from '../buttons/ViewAllButton'
import Row from '../util/Row'
import { FontSizes } from '@/constants/typography'


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
    if (manhwas.length === 0)  { return <></> }

    return (
        <View style={styles.container} >
            <Row style={{width: '100%', justifyContent: "space-between"}} >
                <Title title={title}/>
                <ViewAllButton onPress={onViewAll} />
            </Row>
            <View style={styles.gridContainer} >
                <FlashList
                    data={manhwas}
                    horizontal={true}
                    estimatedItemSize={AppConstants.MANHWA_COVER.WIDTH}
                    drawDistance={wp(120)}
                    showsHorizontalScrollIndicator={false}
                    keyExtractor={(item: Manhwa) => item.manhwa_id.toString()}
                    renderItem={({item}) => <ManhwaCard manhwa={item} showChaptersPreview={false} />}
                />
            </View>
        </View>
    )
}

export default ManhwaHorizontalGrid

const styles = StyleSheet.create({
    container: {
        width: '100%',
        gap: AppConstants.COMMON.GAP
    },
    gridContainer: {
        width: '100%', 
        height: hp(44)
        // height: AppConstants.MANHWA_COVER.HEIGHT + AppConstants.COMMON.GAP * 3 + FontSizes.xl * 3        
    }
})