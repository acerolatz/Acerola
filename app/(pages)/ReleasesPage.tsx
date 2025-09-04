import { FlatList, SafeAreaView, View, StyleSheet, Animated } from 'react-native';
import PageActivityIndicator from '@/app/components/util/PageActivityIndicator';
import SourceCodeButton from '@/app/components/buttons/SourceCodeButton';
import { spFetchReleasesAndSourceCode } from '../../lib/supabase';
import React, { useEffect, useState, useCallback, useRef } from 'react';
import ReleaseButton from '@/app/components/buttons/ReleaseButton';
import ReturnButton from '@/app/components/buttons/ReturnButton';
import { useAppVersionState } from '@/hooks/appVersionState';
import { AppRelease, SourceCodeLink } from '@/helpers/types';
import { AppConstants } from '@/constants/AppConstants';
import AppVersion from '@/app/components/AppVersion';
import Footer from '@/app/components/util/Footer';
import { AppStyle } from '@/styles/AppStyle';
import TopBar from '@/app/components/TopBar';
import Row from '@/app/components/util/Row';
import { wp } from '@/helpers/util';


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
    <View style={styles.container}>
      <AppVersion />
      <FlatList
        data={releasesInfo.releases}
        keyExtractor={(item, index) => `${item.version}-${index}`}
        renderItem={renderReleaseItem}
        ListFooterComponent={renderFooter}
        showsVerticalScrollIndicator={false}
      />
    </View>,
    <View style={styles.container}>
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
          <View style={AppStyle.dotsContainer}>
              {screens.map((_, i) => {
                  const opacity = scrollX.interpolate({
                      inputRange: [(i - 1) * AppConstants.UI.SCREEN.VALID_WIDTH, i * AppConstants.UI.SCREEN.VALID_WIDTH, (i + 1) * AppConstants.UI.SCREEN.VALID_WIDTH],
                      outputRange: [0.3, 1, 0.3],
                      extrapolate: 'clamp',
                  });
                  return <Animated.View key={i} style={[AppStyle.dot, { opacity }]} />
              })}
          </View>
          <ReturnButton />
        </Row>
      </TopBar>
        <View style={{flex: 1}}>
        <Animated.FlatList
            data={screens}
            keyboardShouldPersistTaps='handled'
            renderItem={({ item }) => <View style={{ width: AppConstants.UI.SCREEN.VALID_WIDTH }}>{item}</View>}
            keyExtractor={(_, index) => index.toString()}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            snapToInterval={AppConstants.UI.SCREEN.VALID_WIDTH}
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
    flex: 1,
    gap: AppConstants.UI.GAP,
    paddingHorizontal: 2
  }
});
