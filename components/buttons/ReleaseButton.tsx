import { Pressable, StyleSheet, Text, View } from 'react-native'
import React, { useState } from 'react'
import { AppRelease } from '@/helpers/types'
import Row from '../util/Row'
import Ionicons from '@expo/vector-icons/Ionicons'
import { AppStyle } from '@/styles/AppStyle'
import { openUrl } from '@/helpers/util'
import { Colors } from '@/constants/Colors'
import { AppConstants } from '@/constants/AppConstants'
import CustomActivityIndicator from '../util/CustomActivityIndicator'


const ReleaseButton = ({release}: {release: AppRelease}) => {

    const [loading, setLoading] = useState(false)

    const onPress = async () => {
        setLoading(true)
        await openUrl(release.url)
        setLoading(false)
    }

    if (loading) {
        return (
            <View style={styles.container}>
                <Row style={{width: '100%', justifyContent: "space-between"}} >
                    <Text style={[AppStyle.textHeader, {color: Colors.backgroundColor}]} >{release.version}</Text>
                    <CustomActivityIndicator size={24} color={Colors.backgroundColor} />
                </Row>
                {
                    release.action &&
                    <Text style={[AppStyle.textRegular, {color: Colors.backgroundColor}]} >{release.action}</Text>
                }
            </View>
        )
    }

    return (
        <Pressable onPress={onPress} style={styles.container}>
            <Row style={{width: '100%', justifyContent: "space-between"}} >
                <Text style={[AppStyle.textHeader, {color: Colors.backgroundColor}]} >{release.version}</Text>
                <Ionicons name='download-outline' size={24} color={Colors.backgroundColor} />
            </Row>
            {
                release.action &&
                <Text style={[AppStyle.textRegular, {color: Colors.backgroundColor}]} >{release.action}</Text>
            }
        </Pressable>
    )
}

export default ReleaseButton

const styles = StyleSheet.create({
    container: {
        width: '100%', 
        padding: 10,
        borderRadius: AppConstants.COMMON.BORDER_RADIUS, 
        backgroundColor: Colors.releasesColor, 
        marginBottom: AppConstants.COMMON.MARGIN
    }
})