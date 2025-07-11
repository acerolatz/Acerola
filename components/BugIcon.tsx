import { Colors } from '@/constants/Colors'
import Ionicons from '@expo/vector-icons/Ionicons'
import React from 'react'


interface BugIconProps {
  size?: number
  color?: string
}


const BugIcon = ({size = 28, color = Colors.BugReportColor}: BugIconProps) => {
  return (
    <Ionicons name='bug-outline' color={color} size={size} />
  )
}

export default BugIcon