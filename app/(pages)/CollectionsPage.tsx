import { useCollectionState } from '@/store/collectionsState'
import ReturnButton from '@/components/buttons/ReturnButton'
import { AppConstants } from '@/constants/AppConstants'
import { Typography } from '@/constants/typography'
import Footer from '@/components/util/Footer'
import { AppStyle } from '@/styles/AppStyle'
import { Collection } from '@/helpers/types'
import { Colors } from '@/constants/Colors'
import TopBar from '@/components/TopBar'
import { hp, wp } from '@/helpers/util'
import { router } from 'expo-router'
import React, { useCallback } from 'react'
import { 
    FlatList, 
    Pressable, 
    SafeAreaView, 
    StyleSheet, 
    Text    
} from 'react-native'


const NUM_COLUMNS = 2
const ITEM_WIDTH = (wp(92) - AppConstants.UI.MARGIN * (NUM_COLUMNS - 1)) / NUM_COLUMNS
const ITEM_HEIGHT = hp(8)


const Item = ({item, index}: {item: Collection, index: number}) => {

    const onPress = useCallback(() => {
        router.navigate({
            pathname: '/(pages)/CollectionPage', 
            params: {
                collection_id: item.collection_id,
                collection_name: item.name                
            }
        })
    }, [item.collection_id])

    return (
        <Pressable
            onPress={onPress}
            style={[styles.item, {marginRight: index % 2 == 0 ? AppConstants.UI.MARGIN : 0}]} >
            <Text style={styles.itemText} >{item.name}</Text>
        </Pressable>
    )
}


const CollectionsPage = () => {
        
    const { collections } = useCollectionState() 

    const renderItem = useCallback(({item, index}: {item: Collection, index: number}) => (
        <Item item={item} index={index} />
    ), [])

    const KeyExtractor = useCallback((item: Collection) => item.collection_id.toString(), [])

    const renderFooter = useCallback(() => <Footer/>, [])

    return (
        <SafeAreaView style={AppStyle.safeArea}>
            <TopBar title="Collections">
                <ReturnButton/>
            </TopBar>
            <FlatList
                data={collections}
                initialNumToRender={20}
                keyExtractor={KeyExtractor}
                showsVerticalScrollIndicator={false}
                numColumns={2}
                renderItem={renderItem}
                ListFooterComponent={renderFooter}
            />
        </SafeAreaView>
    )
}

export default CollectionsPage

const styles = StyleSheet.create({
    item: {
        width: ITEM_WIDTH,
        height: ITEM_HEIGHT,
        paddingHorizontal: 10,
        alignItems: "center", 
        justifyContent: "center",         
        backgroundColor: Colors.primary, 
        borderRadius: AppConstants.UI.BORDER_RADIUS,
        marginBottom: AppConstants.UI.MARGIN
    },
    itemText: {
        ...Typography.regular, 
        color: Colors.backgroundColor, 
        textAlign: "center", 
        alignSelf: "center"
    }
})