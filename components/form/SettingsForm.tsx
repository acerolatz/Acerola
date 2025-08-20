import UserDataComponent from '../UserActivityComponent';
import { AppConstants } from '@/constants/AppConstants';
import PerformanceUIForm from './PerformanceUIForm';
import { Typography } from '@/constants/typography';
import { Colors } from '@/constants/Colors';
import SafeModeForm from './SafeModeForm';
import React, { useRef } from 'react';
import CacheForm from './CacheForm';
import { wp } from '@/helpers/util';
import {
  View,
  Animated,  
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';

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

    const titles = ['Safe Mode', 'Optimization', 'Cache', 'User Data']

    const forms = [
      <SafeModeForm key="safe" safeModeOn={safeModeOn} safeModePassword={safeModePassword} />,      
      <PerformanceUIForm key="perf" />,
      <CacheForm key="cache" currentCacheSize={currentCacheSize} currentMaxCacheSize={currentMaxCacheSize} />,
      <UserDataComponent/>
    ];

    const scrollX = useRef(new Animated.Value(0)).current;

    return (
      <KeyboardAvoidingView style={{flex: 1}} behavior={Platform.OS === 'ios' ? 'padding' : 'height'} >
        <View style={styles.container}>
            <View style={{width: '100%', alignItems: "center", justifyContent: "center", marginBottom: AppConstants.GAP * 2}} >
                {titles.map((t, i) => {
                    const opacity = scrollX.interpolate({
                        inputRange: [(i - 1) * width, i * width, (i + 1) * width],
                        outputRange: [0, 1, 0],
                        extrapolate: 'clamp',
                    });
                    const translateY = scrollX.interpolate({
                        inputRange: [(i - 1) * width, i * width, (i + 1) * width],
                        outputRange: [10, 0, -10],
                        extrapolate: 'clamp',
                    });
                    return (
                        <Animated.Text
                            key={i}
                            style={{
                                position: 'absolute',
                                ...Typography.semibold,
                                color: Colors.primary,
                                opacity,
                                transform: [{ translateY }]
                            }}
                        >
                            {t}
                        </Animated.Text>
                    )
                })}
            </View>

            <View style={styles.dotsContainer}>
                {forms.map((_, i) => {
                    const opacity = scrollX.interpolate({
                        inputRange: [(i - 1) * width, i * width, (i + 1) * width],
                        outputRange: [0.3, 1, 0.3],
                        extrapolate: 'clamp',
                    });

                    return <Animated.View key={i} style={[styles.dot, { opacity }]} />
                })}
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
                decelerationRate='fast'
                disableIntervalMomentum={true}
                bounces
                onScroll={Animated.event(
                    [{ nativeEvent: { contentOffset: { x: scrollX } } }],
                    { useNativeDriver: true }
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
