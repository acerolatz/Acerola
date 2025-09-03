import { copyToClipboard, openUrl } from '@/helpers/util'
import { Pressable, StyleSheet, Text } from 'react-native'
import { AppConstants } from '@/constants/AppConstants'
import { Typography } from '@/constants/typography'
import { DonateMethod } from '@/helpers/types'
import Ionicons from '@expo/vector-icons/Ionicons'
import { Colors } from '@/constants/Colors'
import Column from './util/Column'
import React from 'react'


const DonateComponent = ({item}: {item: DonateMethod}) => {  
    const iconName = item.action == "copy" ? "copy-outline" : "globe-outline"    

    const onPress = async (donate: DonateMethod) => {
        switch (donate.action) {
          case "copy":
            await copyToClipboard(donate.value)
            break
          case "link":
            await openUrl(donate.value)
            break
          default:
            break
        }
    }

    return (
      <Pressable onPress={() => onPress(item)} style={styles.donateButton} >
        <Column style={styles.donateTitleContainer} >
          <Text style={[Typography.regular, {color: Colors.backgroundColor}]}>{item.method}</Text>
          <Ionicons name={iconName as any} size={AppConstants.UI.ICON.SIZE} color={Colors.backgroundColor} />
        </Column>
        <Text style={[Typography.regular, {color: Colors.backgroundColor}]}>{item.value}</Text>
      </Pressable>
    )
}


export default DonateComponent


const styles = StyleSheet.create({
  donateButton: {
    maxWidth: '100%', 
    paddingHorizontal: AppConstants.UI.ITEM_PADDING.HORIZONTAL,
    paddingVertical: AppConstants.UI.ITEM_PADDING.VERTICAL,
    borderRadius: AppConstants.UI.BORDER_RADIUS, 
    backgroundColor: Colors.primary, 
    marginBottom: AppConstants.UI.MARGIN
  },
  donateTitleContainer: {
    width: "100%", 
    flexDirection: 'row', 
    alignItems: "center",
    justifyContent: "space-between"
  }
})