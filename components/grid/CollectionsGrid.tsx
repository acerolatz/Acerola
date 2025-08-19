import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native'
import ViewAllButton from '../buttons/ViewAllButton'
import { Typography } from '@/constants/typography'
import { Collection } from '@/helpers/types'
import { AppStyle } from '@/styles/AppStyle'
import { Colors } from '@/constants/Colors'
import React, { useCallback } from 'react'
import { router } from 'expo-router'
import Row from '../util/Row'
import Title from '../Title'



const CollectionGrid = ({collections}: {collections: Collection[]}) => {

    const onPress = (collection: Collection) => {
        router.navigate({
            pathname: '/(pages)/CollectionPage', 
            params: {
                collection_name: collection.name,
                collection_id: collection.collection_id                
            }
        })
    }

    const viewAllCollections = useCallback(() => {
        router.navigate("/(pages)/CollectionsPage")
    }, [])

    const renderItem = ({item}: {item: Collection}) => {
        return (
            <Pressable onPress={() => onPress(item)} style={AppStyle.defaultGridItem} >
                <Text style={[Typography.regular, {color: Colors.backgroundColor}]}>{item.name}</Text>
            </Pressable>
        )
    }    

    if (collections.length === 0) { return <></> }

    return (
        <View style={styles.container} >
            <Row style={{width: '100%', justifyContent: "space-between"}} >
                <Title title='Collections'/>
                <ViewAllButton onPress={viewAllCollections} />
            </Row>
            <FlatList
                data={collections}
                horizontal={true}
                initialNumToRender={10}
                showsHorizontalScrollIndicator={false}
                keyExtractor={(item) => item.collection_id.toString()}
                renderItem={renderItem}
            />
        </View>
    )
}

export default CollectionGrid

const styles = StyleSheet.create({
    container: {
        width: '100%',
        gap: 10,
        alignItems: "flex-start"
    }    
})