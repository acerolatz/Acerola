import { Pressable, StyleSheet, Text, View } from 'react-native'
import { AppConstants } from '@/constants/AppConstants'
import { Typography } from '@/constants/typography'
import Ionicons from '@expo/vector-icons/Ionicons'
import { SourceCodeLink } from '@/helpers/types'
import { AppStyle } from '@/styles/AppStyle'
import { Colors } from '@/constants/Colors'
import React, { useState } from 'react'
import { openUrl } from '@/helpers/util'


const SourceCodeButton = ({item}: {item: SourceCodeLink}) => {

    const [loading, setLoading] = useState(false)

    const onPress = async () => {
        setLoading(true)
        await openUrl(item.url)
        setLoading(false)
    }

    let iconName = 'code-slash-outline'

    if (item.name == "GitHub") {
        iconName = 'logo-github'
    } else if (item.name == "GitLab") {
        iconName = 'logo-gitlab'
    }

    if (loading) {
        return (
            <View style={styles.container} >
                <Ionicons name={iconName as any} size={AppConstants.UI.ICON.SIZE} color={Colors.backgroundColor} />
                <Text style={{...Typography.regular, color: Colors.backgroundColor}}>{item.name}</Text>
            </View>
        )
    }    

    return (
        <Pressable onPress={onPress} style={styles.container} >
            <Ionicons name={iconName as any} size={AppConstants.UI.ICON.SIZE} color={Colors.backgroundColor} />
            <Text style={{...Typography.regular, color: Colors.backgroundColor}}>{item.name}</Text>
        </Pressable>
    )
}

export default SourceCodeButton

const styles = StyleSheet.create({
    container: {
        ...AppStyle.defaultGridItem,
        gap: AppConstants.UI.GAP,
        flexDirection: 'row'
    }    
})