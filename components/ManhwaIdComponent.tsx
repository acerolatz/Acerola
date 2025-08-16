import { AppConstants } from '@/constants/AppConstants'
import { StyleSheet, Text, View } from 'react-native'
import { Typography } from '@/constants/typography'
import { Colors } from '@/constants/Colors'
import React from 'react'
import { hp } from '@/helpers/util'


interface ManhwaIdComponentProps {
    manhwa_id: number
    position?: 'l' | 'r'
}

const ManhwaIdComponent = ({manhwa_id, position = 'l'}: ManhwaIdComponentProps) => {

    if (AppConstants.DEBUB.ENABLED) {
        return position === 'l' ?        
            <View style={[styles.container, {left: hp(1)}]} >
                <Text style={Typography.regular}>{manhwa_id}</Text>
            </View>
            :
            <View style={[styles.container, {right: hp(1)}]} >
                <Text style={Typography.regular}>{manhwa_id}</Text>
            </View>
        
    }

    return <></>
}

export default ManhwaIdComponent

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: hp(1),
        borderRadius: AppConstants.COMMON.BORDER_RADIUS,
        paddingHorizontal: AppConstants.COMMON.ITEM_PADDING_HORIZONTAL,
        paddingVertical: AppConstants.COMMON.ITEM_PADDING_VERTICAL,
        backgroundColor: Colors.backgroundSecondary, 
        alignItems: "center", 
        justifyContent: "center"
    }
})