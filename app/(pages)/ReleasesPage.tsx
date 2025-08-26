import { FlatList, SafeAreaView, View, Text, StyleSheet } from 'react-native';
import PageActivityIndicator from '@/components/util/PageActivityIndicator';
import SourceCodeButton from '@/components/buttons/SourceCodeButton';
import { spFetchReleasesAndSourceCode } from '../../lib/supabase';
import React, { useEffect, useState, useCallback } from 'react';
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


const Releases = () => {
  
  const { releasesInfo, setReleasesInfo } = useAppVersionState();
  const [loading, setLoading] = useState(false);  
  
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

  return (
    <SafeAreaView style={AppStyle.safeArea}>
      <TopBar title="Releases">
          <ReturnButton />
      </TopBar>
      {
        loading ? <PageActivityIndicator />
        :
        <View style={styles.container}>
            {/* Source Code Section */}
            <View style={{gap: AppConstants.GAP}}>
                <Text style={Typography.semibold}>Source Code</Text>
                <FlatList
                  data={releasesInfo.source}
                  keyExtractor={(item) => item.url}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  renderItem={renderSourceItem}
                />
            </View>

            {/* Packages Section */}
            <View style={styles.section}>
                <Text style={Typography.semibold}>Packages</Text>
                <AppVersion />
                <FlatList
                  data={releasesInfo.releases}
                  keyExtractor={(item, index) => `${item.version}-${index}`}
                  renderItem={renderReleaseItem}
                  ListFooterComponent={renderFooter}
                  showsVerticalScrollIndicator={false}
                />
            </View>
        </View>
      }
    </SafeAreaView>
  );
};

export default Releases;

const styles = StyleSheet.create({
  container: {
    width: '100%',
    flex: 1,
    gap: AppConstants.GAP,
  },
  section: {
    flex: 1,
    gap: AppConstants.GAP,
  },
});
