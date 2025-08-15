import TopBar from '@/components/TopBar'
import ReturnButton from '@/components/buttons/ReturnButton'
import Footer from '@/components/util/Footer'
import { AppConstants } from '@/constants/AppConstants'
import { Colors } from '@/constants/Colors'
import { Typography } from '@/constants/typography'
import { Collection } from '@/helpers/types'
import { hp, wp } from '@/helpers/util'
import { dbReadCollections } from '@/lib/database'
import { AppStyle } from '@/styles/AppStyle'
import { router } from 'expo-router'
import { useSQLiteContext } from 'expo-sqlite'
import React, { useEffect, useState } from 'react'
import { 
    FlatList, 
    Pressable, 
    SafeAreaView, 
    StyleSheet, 
    Text    
} from 'react-native'


const NUM_COLUMNS = 2
const ITEM_WIDTH = (wp(92) - AppConstants.COMMON.MARGIN * (NUM_COLUMNS - 1)) / NUM_COLUMNS
const ITEM_HEIGHT = hp(8)


const CollectionsPage = () => {
    
    const db = useSQLiteContext()
    const [collections, setCollections] = useState<Collection[]>([])

    useEffect(
        () => {
            const init = async () => {
                const c = await dbReadCollections(db)
                setCollections(c)
            }
            init()
        },
        [db]
    )    

    const onCollectionPress = async (collection: Collection) => {
        router.navigate({
            pathname: '/(pages)/CollectionPage', 
            params: {
                collection_id: collection.collection_id,
                collection_name: collection.name                
            }
        })
    }
    
    const renderItem = ({item, index}: {item: Collection, index: number}) => {
        return (
            <Pressable
                onPress={() => onCollectionPress(item)}
                style={[styles.item, {marginRight: index % 2 == 0 ? AppConstants.COMMON.MARGIN : 0}]} >
                <Text style={styles.itemText} >{item.name}</Text>
            </Pressable>
        )
    }    

    return (
        <SafeAreaView style={AppStyle.safeArea}>
            <TopBar title="Collections">
                <ReturnButton/>
            </TopBar>
            <FlatList
                data={collections}
                initialNumToRender={30}
                keyExtractor={(item) => item.collection_id.toString()}
                showsVerticalScrollIndicator={false}
                numColumns={2}
                renderItem={renderItem}
                ListFooterComponent={<Footer height={hp(12)}/>}
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
        backgroundColor: Colors.yellow, 
        borderRadius: AppConstants.COMMON.BORDER_RADIUS,
        marginBottom: AppConstants.COMMON.MARGIN
    },
    itemText: {
        ...Typography.regular, 
        color: Colors.backgroundColor, 
        textAlign: "center", 
        alignSelf: "center"
    }
})