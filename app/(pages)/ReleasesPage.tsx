import { FlatList, SafeAreaView, View, Text, StyleSheet, Animated } from 'react-native';
import PageActivityIndicator from '@/components/util/PageActivityIndicator';
import SourceCodeButton from '@/components/buttons/SourceCodeButton';
import { spFetchReleasesAndSourceCode } from '../../lib/supabase';
import React, { useEffect, useState, useCallback, useRef } from 'react';
import ReleaseButton from '@/components/buttons/ReleaseButton';
import ReturnButton from '@/components/buttons/ReturnButton';
import { useAppVersionState } from '@/store/appVersionState';
import { AppRelease, SourceCodeLink } from '@/helpers/types';
import { AppConstants } from '@/constants/AppConstants';
import { Typography } from '@/constants/typography';
import AppVersion from '@/components/AppVersion';
import Footer from '@/components/util/Footer';
import { AppStyle } from '@/styles/AppStyle';
import TopBar from '@/components/TopBar';
import { Colors } from '@/constants/Colors';
import { wp } from '@/helpers/util';
import Row from '@/components/util/Row';


const width = wp(92)


const Releases = () => {
  
  const { releasesInfo, setReleasesInfo } = useAppVersionState();
  const [loading, setLoading] = useState(false);  
  const scrollX = useRef(new Animated.Value(0)).current;

  useEffect(() => { 
    const init = async () => {
      setLoading(true);
      const data = await spFetchReleasesAndSourceCode();
      setReleasesInfo(data);
      setLoading(false);        
    }
    init()
  }, []);

  const renderSourceItem = useCallback(
    ({ item }: {item: SourceCodeLink}) => <SourceCodeButton item={item} />,
    []
  );

  const renderReleaseItem = useCallback(
    ({ item }: {item: AppRelease}) => <ReleaseButton release={item} />,
    []
  );

  const renderFooter = useCallback(() => <Footer/>, [])

  const screens = [
    <View style={styles.section}>
      <AppVersion />
      <FlatList
        data={releasesInfo.releases}
        keyExtractor={(item, index) => `${item.version}-${index}`}
        renderItem={renderReleaseItem}
        ListFooterComponent={renderFooter}
        showsVerticalScrollIndicator={false}
      />
    </View>,
    <View style={{gap: AppConstants.UI.GAP}}>
      <FlatList        
        data={releasesInfo.source}
        keyExtractor={(item) => item.url}
        showsHorizontalScrollIndicator={false}
        renderItem={renderSourceItem}
      />
    </View>
  ]

  if (loading) {
    return (
      <SafeAreaView style={AppStyle.safeArea} >
        <TopBar title="Releases">
          <ReturnButton />
        </TopBar>
        <PageActivityIndicator/>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={AppStyle.safeArea}>
      <TopBar title="Releases">
        <Row style={{gap: AppConstants.UI.GAP}} >
          <View style={styles.dotsContainer}>
              {screens.map((_, i) => {
                  const opacity = scrollX.interpolate({
                      inputRange: [(i - 1) * width, i * width, (i + 1) * width],
                      outputRange: [0.3, 1, 0.3],
                      extrapolate: 'clamp',
                  });

                  return <Animated.View key={i} style={[styles.dot, { opacity }]} />
              })}
          </View>
          <ReturnButton />
        </Row>
      </TopBar>
        <View style={{flex: 1}}>
        <Animated.FlatList
            data={screens}
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
    </SafeAreaView>
  );
};

export default Releases;

const styles = StyleSheet.create({
  container: {
    width: '100%',
    flex: 1,
    gap: AppConstants.UI.GAP,
  },
  section: {
    flex: 1,
    gap: AppConstants.UI.GAP,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center'    
  },
  dot: {
    height: AppConstants.UI.ICON.SIZE * 0.5,
    width: AppConstants.UI.ICON.SIZE * 0.5,
    borderRadius: AppConstants.UI.ICON.SIZE,
    backgroundColor: Colors.primary,
    marginHorizontal: 4,
  }
});
