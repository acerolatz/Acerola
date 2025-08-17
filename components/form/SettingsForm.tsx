import React, { useRef, useState } from 'react';
import {
  View,
  Animated,  
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import UiForm from './UiForm';
import PerformanceUIForm from './PerformanceUIForm';
import SafeModeForm from './SafeModeForm';
import CacheForm from './CacheForm';
import { Colors } from '@/constants/Colors';
import { wp } from '@/helpers/util';
import { Typography } from '@/constants/typography';
import UserActivityHistory from '../UserActivityHistory';
import { AppConstants } from '@/constants/AppConstants';

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
    const titles = ['Safe Mode', 'UI', 'Optimization', 'Cache', 'History']

    const forms = [
      <SafeModeForm key="safe" safeModeOn={safeModeOn} safeModePassword={safeModePassword} />,
      <UiForm key="ui" />,
      <PerformanceUIForm key="perf" />,
      <CacheForm key="cache" currentCacheSize={currentCacheSize} currentMaxCacheSize={currentMaxCacheSize} />,
      <UserActivityHistory/>
    ];

    const scrollX = useRef(new Animated.Value(0)).current;
    const handleMomentumScrollEnd = (e: any) => {
      const offsetX = e.nativeEvent.contentOffset.x;
      const index = Math.round(offsetX / width);
      setTitle(titles[index])
    };

    return (
      <KeyboardAvoidingView style={{flex: 1}} behavior={Platform.OS === 'ios' ? 'padding' : 'height'} >
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
                keyboardShouldPersistTaps='handled'
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
      </KeyboardAvoidingView>
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
    marginTop: AppConstants.MARGIN,
    marginBottom: AppConstants.MARGIN * 2
  },
  dot: {
      height: AppConstants.ICON.SIZE * 0.5,
      width: AppConstants.ICON.SIZE * 0.5,
      borderRadius: AppConstants.ICON.SIZE,
      backgroundColor: Colors.primary,
      marginHorizontal: 4,
  }
});
