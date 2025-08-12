import { Colors } from '@/constants/Colors'
import { Collection } from '@/helpers/types'
import { AppStyle } from '@/styles/AppStyle'
import { router } from 'expo-router'
import React from 'react'
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native'
import ViewAllButton from '../buttons/ViewAllButton'
import Title from '../Title'
import Row from '../util/Row'
import { AppConstants } from '@/constants/AppConstants'




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

    const viewAllCollections = () => {
        router.navigate("/(pages)/CollectionsPage")
    }

    const renderItem = ({item}: {item: Collection}) => {
        return (
            <Pressable onPress={() => onPress(item)} style={styles.button} >
                <Text style={[AppStyle.textRegular, {color: Colors.backgroundColor}]}>{item.name}</Text>
            </Pressable>
        )
    }    

    if (collections.length === 0) {
        return <></>
    }

    return (
        <View style={styles.container} >
            <Row style={{width: '100%', justifyContent: "space-between"}} >
                <Title title='Collections'/>
                <ViewAllButton onPress={viewAllCollections} />
            </Row>
            <FlatList
                data={collections}
                horizontal={true}
                initialNumToRender={30}
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
    },
    button: {
        paddingHorizontal: 10,
        paddingVertical: 12,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: AppConstants.COMMON.BORDER_RADIUS,
        backgroundColor: Colors.yellow,
        marginRight: AppConstants.COMMON.MARGIN
    }
})