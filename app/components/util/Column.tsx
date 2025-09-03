import React from 'react'
import { View, ViewProps } from 'react-native'


const Column = (props: ViewProps) => {
  
    const { style, ...rest } = props
    
    return (
        <View style={[style]} {...rest} />
    )

}


export default Column
