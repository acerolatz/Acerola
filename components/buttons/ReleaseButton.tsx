import { Pressable, StyleSheet, Text, View } from 'react-native'
import React, { useCallback } from 'react'
import { AppRelease } from '@/helpers/types'
import { openUrl } from '@/helpers/util'
import { Colors } from '@/constants/Colors'
import { AppConstants } from '@/constants/AppConstants'
import { Typography } from '@/constants/typography'
import Ionicons from '@expo/vector-icons/Ionicons'


interface ReleaseButtonProps {
    release: AppRelease
}


const ReleaseButton = React.memo(({ release }: ReleaseButtonProps) => {    

    const onPress = useCallback(async () => {
        await openUrl(release.url)
    }, [release.url])
    
    const border = release.descr !== null ? 0 : AppConstants.BORDER_RADIUS
    
    return (
        <Pressable onPress={onPress} style={styles.itemContainer}>
            <View style={{...styles.itemTitleContainer, borderBottomLeftRadius: border, borderBottomRightRadius: border}}>
                <Text style={[Typography.regular, { color: Colors.backgroundColor }]}>{release.version}</Text>
                <Ionicons name='download-outline' size={AppConstants.ICON.SIZE} color={Colors.backgroundColor} />
            </View>
            {
                release.descr &&
                <View style={styles.itemBodyContainer}>
                    <Text style={{...Typography.regular, color: Colors.white}}>{release.descr}</Text>
                </View>
            }
        </Pressable>
    )
})


export default ReleaseButton


const styles = StyleSheet.create({
    itemContainer: {
        width: '100%', 
        marginBottom: 10
    },
    itemTitleContainer: {
        flexDirection: 'row',
        alignItems: "center",
        justifyContent: "space-between",
        padding: 10, 
        backgroundColor: Colors.primary, 
        borderRadius: AppConstants.BORDER_RADIUS, 
        borderBottomLeftRadius: 0, 
        borderBottomRightRadius: 0
    },
    itemBodyContainer: {
        padding: 10, 
        borderWidth: 1, 
        borderTopWidth: 0, 
        borderTopLeftRadius: 0, 
        borderTopRightRadius: 0, 
        borderColor: Colors.primary, 
        borderRadius: AppConstants.BORDER_RADIUS
    }
})