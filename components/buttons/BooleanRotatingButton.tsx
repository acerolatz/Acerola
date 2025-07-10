import { AppConstants } from '@/constants/AppConstants';
import Ionicons from '@expo/vector-icons/Ionicons';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Pressable, StyleSheet } from 'react-native';


interface BooleanRotatingButtonProps {
    onPress: () => any
    iconSize: number
    iconColor: string
    iconName?: string
}


const BooleanRotatingButton = ({onPress, iconSize, iconColor, iconName = 'sync'}: BooleanRotatingButtonProps) => {
    const [isRotating, setIsRotating] = useState(false)
    const rotateValue = new Animated.Value(0);

    const rotateIsActive = useRef(false)
  
    useEffect(() => {
        let animation: Animated.CompositeAnimation;
        
        if (isRotating) {
            animation = Animated.loop(
                Animated.timing(rotateValue, {
                toValue: 1,
                duration: 1000,
                useNativeDriver: true,
            }));
            animation.start();
        }

        return () => {
            if (animation) animation.stop();
        };
    }, [isRotating]);
    
    const rotation = rotateValue.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg'],
    });

    const handlePress = async () => {
        if (rotateIsActive.current) { return }
        rotateIsActive.current = true
        setIsRotating(true)
        await onPress()
        rotateIsActive.current = false
        setIsRotating(false)
    }

    if (isRotating) {
        return (
            <Animated.View
            style={[
                styles.box,
                { width: iconSize, height: iconSize, transform: [{ rotate: rotation }] },
            ]}>
                <Ionicons name={iconName as any} size={iconSize} color={iconColor}/>
            </Animated.View>
        );
    }

    return (
        <Pressable onPress={handlePress} hitSlop={AppConstants.COMMON.HIT_SLOP.NORMAL}>
            <Animated.View
            style={[
                styles.box,
                { width: iconSize, height: iconSize, transform: [{ rotate: rotation }] },
            ]}>
                <Ionicons name={iconName as any} size={iconSize} color={iconColor}/>
            </Animated.View>
        </Pressable>        
    );
}

export default BooleanRotatingButton

const styles = StyleSheet.create({
    box: {
        justifyContent: 'center',
        alignItems: 'center'
    },
})