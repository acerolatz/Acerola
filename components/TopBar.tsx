import { AppConstants } from '@/constants/AppConstants'
import { StyleSheet, Text, View } from 'react-native'
import { Typography } from '@/constants/typography'
import { Colors } from '@/constants/Colors'
import React from 'react'


interface TopBarProps {
  title: string  
  titleColor?: string
  children?: React.JSX.Element
} 


/**
 * TopBar component for displaying a title and optional child elements.
 *
 * Renders a single-line title text with a customizable color and optional
 * children elements (e.g., buttons, icons) aligned in the top bar.
 *
 * @param title - Text displayed in the top bar. Required.
 * @param titleColor - Optional color of the title text. Defaults to `Colors.primary`.
 * @param children - Optional React element(s) to render inside the top bar.
 *
 * @example
 * <TopBar title="Manhwa List" titleColor={Colors.yellow}>
 *   <IconButton icon="search" onPress={handleSearch} />
 * </TopBar>
 *
 * @remarks 
 * - Title is constrained to a single line via `numberOfLines={1}`.
 */
const TopBar = ({title, children, titleColor = Colors.primary}: TopBarProps) => {
  return (
    <View style={styles.container} >
        <Text
          numberOfLines={1}
          style={[styles.title, {color: titleColor}]}>
          {title}
        </Text>
        {children}
    </View>
  )
}

export default TopBar


const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: AppConstants.GAP,
    gap: AppConstants.GAP,
    flexDirection: 'row',
    alignItems: "center", 
    justifyContent: "space-between"
  },
  title: {
    ...Typography.semiboldXl,
    flexShrink: 1
  }
})