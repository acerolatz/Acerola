import { AppConstants } from '@/constants/AppConstants'
import { StyleSheet, Text, View } from 'react-native'
import { Typography } from '@/constants/typography'
import { Colors } from '@/constants/Colors'
import { hp } from '@/helpers/util'
import React from 'react'


interface ManhwaIdComponentProps {
    manhwa_id: number
    position?: 'l' | 'r'
}


const ManhwaIdComponent = ({manhwa_id, position = 'l'}: ManhwaIdComponentProps) => {

    if (AppConstants.APP.DEBUG.ENABLED) {
        return position === 'l' ?        
            <View style={{...styles.container, left: AppConstants.UI.SCREEN.PADDING_HORIZONTAL + hp(1)}} >
                <Text style={Typography.regular}>{manhwa_id}</Text>
            </View>
            :
            <View style={{...styles.container, right: AppConstants.UI.SCREEN.PADDING_HORIZONTAL + hp(1)}} >
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
        borderRadius: AppConstants.UI.BORDER_RADIUS,
        paddingHorizontal: AppConstants.UI.ITEM_PADDING.HORIZONTAL,
        paddingVertical: AppConstants.UI.ITEM_PADDING.VERTICAL,
        backgroundColor: Colors.backgroundSecondary, 
        alignItems: "center", 
        justifyContent: "center"
    }
})