import { AppConstants } from '@/constants/AppConstants';
import React, { useEffect, useRef } from 'react';
import { Animated, Image, StyleSheet, View } from 'react-native';


interface ImageTransitionDemoProps {
  duration: number
  width: number
  height: number
  isActive?: boolean
}


const ImageTransitionDemo = ({
  duration,
  width,
  height,
  isActive = true
}: ImageTransitionDemoProps) => {
  
    const opacity = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (!isActive) {
            opacity.setValue(1)
            return 
        }
        const loop = Animated.loop(
            Animated.sequence([
                Animated.timing(opacity, {
                    toValue: 1,
                    duration,
                    useNativeDriver: true,
                }),
                Animated.timing(opacity, {
                    toValue: 0,
                    duration,
                    useNativeDriver: true,
                }),
            ])
        );
        loop.start();
        return () => loop.stop();
    }, [opacity, duration, isActive]);

    return (
        <View style={styles.container}>
            <Animated.Image
                source={require("@/assets/images/Addicted to My Mom.webp")}
                style={[styles.image, { width, height, opacity },]}
                resizeMode="cover"
            />
        </View>
    )
};

export default ImageTransitionDemo;

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center'    
  },
  image: {
    borderRadius: AppConstants.BORDER_RADIUS
  },
});
