import { Pressable, StyleSheet, Text, View } from 'react-native'
import React, { useState } from 'react'
import { SourceCodeLink } from '@/helpers/types'
import { Colors } from '@/constants/Colors'
import { AppConstants } from '@/constants/AppConstants'
import { AppStyle } from '@/styles/AppStyle'
import Ionicons from '@expo/vector-icons/Ionicons'
import { openUrl, wp } from '@/helpers/util'


const SourceCodeButton = ({item}: {item: SourceCodeLink}) => {

    const [loading, setLoading] = useState(false)

    const onPress = async () => {
        setLoading(true)
        await openUrl(item.url)
        setLoading(false)
    }

    let iconName = 'globe-outline'

    if (item.name == "GitHub") {
        iconName = 'logo-github'
    } else if (item.name == "GitLab") {
        iconName = 'logo-gitlab'
    }    

    const showText = iconName === 'globe-outline'

    if (loading) {
        return (
            <View style={styles.container} >
                <Ionicons name={iconName as any} size={AppConstants.ICON.SIZE} color={Colors.backgroundColor} />
                {showText && <Text style={styles.text}>{item.name}</Text>}
            </View>
        )
    }    

    return (
        <Pressable onPress={onPress} style={styles.container} >
            <Ionicons name={iconName as any} size={AppConstants.ICON.SIZE} color={Colors.backgroundColor} />
            {showText && <Text style={styles.text}>{item.name}</Text>}
        </Pressable>
    )
}

export default SourceCodeButton

const styles = StyleSheet.create({
    container: {
        height: 52,
        paddingHorizontal: 16,
        flex: 1,
        gap: 10,
        flexDirection: 'row',
        alignItems: "center",        
        justifyContent: "center",
        borderRadius: AppConstants.COMMON.BORDER_RADIUS,
        backgroundColor: Colors.yellow
    },
    text: {
        ...AppStyle.textRegular,
        color: Colors.backgroundColor
    }
})