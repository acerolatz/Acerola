import React, { useRef, useState } from 'react';
import {
  View,
  Animated,  
  Text,
  StyleSheet,
} from 'react-native';
import UiForm from './UiForm';
import PerformanceUIForm from './PerformanceUIForm';
import SafeModeForm from './SafeModeForm';
import CacheForm from './CacheForm';
import { Colors } from '@/constants/Colors';
import { wp } from '@/helpers/util';
import { Typography } from '@/constants/typography';

interface SettingsFormProps {
  currentMaxCacheSize: number;
  currentCacheSize: number;
  safeModePassword: string;
  safeModeOn: boolean;
}

const width = wp(92)

const SettingsForm = ({
  currentMaxCacheSize,
  currentCacheSize,
  safeModePassword,
  safeModeOn,
}: SettingsFormProps) => {

    const [title, setTitle] = useState('Safe Mode')
    const titles = ['Safe Mode', 'UI', 'Performance', 'Cache']

    const forms = [
        <SafeModeForm key="safe" safeModeOn={safeModeOn} safeModePassword={safeModePassword} />,
        <UiForm key="ui" />,
        <PerformanceUIForm key="perf" />,
        <CacheForm key="cache" currentCacheSize={currentCacheSize} currentMaxCacheSize={currentMaxCacheSize} />,
    ];

    const scrollX = useRef(new Animated.Value(0)).current;


    const handleMomentumScrollEnd = (e: any) => {
        const offsetX = e.nativeEvent.contentOffset.x;
        const index = Math.round(offsetX / width);
        setTitle(titles[index])
    };

    return (
        <View style={styles.container}>
            <View style={{width: '100%', alignItems: "center", justifyContent: "center"}} >
                <Text style={{...Typography.semibold, color: Colors.primary}} >{title}</Text>
            </View>
            <View style={styles.dotsContainer}>
                {
                    forms.map((_, i) => {
                        const opacity = scrollX.interpolate({
                            inputRange: [
                            (i - 1) * width,
                            i * width,
                            (i + 1) * width,
                            ],
                            outputRange: [0.3, 1, 0.3],
                            extrapolate: 'clamp',
                        });

                        return (
                            <Animated.View key={i} style={[styles.dot, { opacity }]}/>
                        );
                    })
                }
            </View>            
            <Animated.FlatList
                data={forms}
                renderItem={({ item }) => <View style={{ width }}>{item}</View>}
                keyExtractor={(_, index) => index.toString()}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                snapToInterval={width}
                decelerationRate="fast"
                bounces
                onMomentumScrollEnd={handleMomentumScrollEnd}
                onScroll={Animated.event(
                    [{ nativeEvent: { contentOffset: { x: scrollX } } }],
                    { useNativeDriver: false }
                )}
                scrollEventThrottle={16}
            />
        
        </View>
    );
};

export default SettingsForm;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 12,
  },
  dot: {
    height: 8,
    width: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
    marginHorizontal: 4,
  },
});
