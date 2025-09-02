import React, { useCallback, useState } from 'react'
import { StyleSheet, View, Text, Pressable } from 'react-native'
import Ionicons from '@expo/vector-icons/Ionicons'
import Row from './util/Row'
import { Colors } from '@/constants/Colors'
import { MotiView } from 'moti'
import { AppConstants } from '@/constants/AppConstants'
import { Typography } from '@/constants/typography'


interface RatingProps {
  value: number
  setValue?: (value: number) => void
  max?: number
  size?: number
  color?: string
  iconFilled?: keyof typeof Ionicons.glyphMap
  iconOutline?: keyof typeof Ionicons.glyphMap
  precision?: number
  readOnly?: boolean
  showValue?: boolean
}


const Rating = ({
  value,
  setValue,
  max = 5,
  size = AppConstants.UI.ICON.SIZE * 1.2,
  color = Colors.backgroundSecondary,
  iconFilled = 'heart',
  iconOutline = 'heart-outline',
  precision = 1,
  readOnly = false,
  showValue = true
}: RatingProps) => {
  const [pressedIndex, setPressedIndex] = useState<number | null>(null)

  const renderItem = useCallback(
    (index: number) => {
      const filled = Math.min(Math.max(value - index + 1, 0), 1)
      const isPressed = pressedIndex === index

      return (
        <Pressable
          key={index}
          onPress={() => !readOnly && setValue?.(index)}
          onPressIn={() => setPressedIndex(index)}
          onPressOut={() => setPressedIndex(null)}
        >
          <MotiView
            from={{ scale: 1 }}
            animate={{ scale: isPressed ? 1.3 : 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 15 }}
            style={{ marginHorizontal: 2 }}
          >
            <View style={{ width: size, height: size }}>
              <Ionicons name={iconOutline} size={size} color={color} style={styles.absolute}/>
              <View style={[styles.absolute, { width: size * filled, overflow: 'hidden'}]}>
                <Ionicons name={iconFilled} size={size} color={color} />
              </View>
            </View>
          </MotiView>
        </Pressable>
      )
    },
    [value, size, color, iconFilled, iconOutline, setValue, readOnly, pressedIndex]
  )

  return (
    <Row style={styles.container}>
      <Row>{Array.from({ length: max }, (_, i) => renderItem(i + 1))}</Row>
      { showValue && <Text style={[Typography.light, { color }]}> {value.toFixed(precision)} </Text> }
    </Row>
  )
}

export default Rating

const styles = StyleSheet.create({
  container: {
    justifyContent: 'flex-start',
    alignItems: 'center',
    gap: AppConstants.UI.MARGIN
  },
  absolute: {
    position: 'absolute',
    top: 0,
    left: 0
  }
})
