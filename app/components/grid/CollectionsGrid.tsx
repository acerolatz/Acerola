import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native'
import { Typography } from '@/constants/typography'
import { Collection } from '@/helpers/types'
import { AppStyle } from '@/styles/AppStyle'
import React, { useCallback } from 'react'
import { router } from 'expo-router'



const Item = ({item}: {item: Collection}) => {

    const onPress = useCallback(() => {
        router.navigate({
            pathname: '/(pages)/CollectionPage', 
            params: {
                collection_name: item.name,
                collection_id: item.collection_id                
            }
        })
    }, [item.collection_id])


    return (
        <Pressable onPress={onPress} style={AppStyle.defaultGridItem} >
            <Text style={Typography.regularBlack}>{item.name}</Text>
        </Pressable>
    )
}


const CollectionGrid = ({collections}: {collections: Collection[]}) => {

    const renderItem = useCallback(({item}: {item: Collection}) => (
        <Item item={item} />
    ), [])

    const KeyExtractor = useCallback((item: Collection) => item.collection_id.toString(), [])    

    if (collections.length === 0) { return <></> }

    return (
        <View style={styles.container} >
            <FlatList
                data={collections}
                horizontal={true}
                initialNumToRender={10}
                showsHorizontalScrollIndicator={false}
                keyExtractor={KeyExtractor}
                renderItem={renderItem}
            />
        </View>
    )
}

export default React.memo(CollectionGrid)

const styles = StyleSheet.create({
    container: {
        width: '100%',
        alignItems: "flex-start"
    }    
})