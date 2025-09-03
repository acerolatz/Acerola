import { Text, StyleSheet, View, SafeAreaView, Animated, KeyboardAvoidingView, Platform } from "react-native";
import { DownloadRequest, DownloadByManhwa, Manhwa } from "@/helpers/types";
import CustomActivityIndicator from "@/app/components/util/CustomActivityIndicator";
import { dbReadDownloadedManhwas, dbReadPendingDownloads } from "@/lib/database";
import { downloadManager } from "@/helpers/DownloadManager";
import ReturnButton from "@/app/components/buttons/ReturnButton";
import { AppConstants } from "@/constants/AppConstants";
import React, { useEffect, useRef, useState } from "react";
import { Typography } from "@/constants/typography";
import TextButton from "@/app/components/buttons/TextButton";
import ManhwaGrid from "@/app/components/grid/ManhwaGrid";
import { AppStyle } from "@/styles/AppStyle";
import { Colors } from "@/constants/Colors";
import { useSQLiteContext } from "expo-sqlite";
import TopBar from "@/app/components/TopBar";
import Row from "@/app/components/util/Row";
import { wp } from "@/helpers/util";


const width = wp(92)


type DownloadState = {
  downloads: Manhwa[]
  pendingDownloads: DownloadRequest[]
  queueSize: number
  currentDownload: DownloadRequest | null  
}


const CurrentDownloadItem = ({item}: {item: DownloadRequest}) => {
  return (
    <Row style={styles.container} >
      <Text style={{...Typography.regularBlack, flexShrink: 1}}>{item.manhwa_name}/{item.chapter_name}</Text>
      <CustomActivityIndicator color={Colors.backgroundColor} />
    </Row>
  )
}


interface ItemProps {
  download: DownloadByManhwa
}


const Item = ({download}: ItemProps) => {

  const [loading, setLoading] = useState(false)
  
  return (
    <Row style={styles.container}>
      <Text style={{...Typography.regularBlack, flexShrink: 1}} >{download.title}</Text>
      <Text style={Typography.regularBlack} >{download.completed_downloads}</Text>
    </Row>
  )
}


interface DownloadQueueProps {
  state: DownloadState
}

const DownloadQueue = ({state}: DownloadQueueProps) => {
  return (
    <View style={{flex: 1}} >
        <Text style={Typography.semibold}>In Queue: {state.queueSize}</Text>
            {
              state.currentDownload &&
              <>
              <CurrentDownloadItem item={state.currentDownload} />
              <Row style={{gap: AppConstants.UI.MARGIN}} >
                <TextButton text="Pause" />
                <TextButton text="Clear" />
              </Row>
              </>
          }
    </View>
  )
}


export default function DownloadPage() {

  const db = useSQLiteContext()
  const [state, setState] = useState<DownloadState>({
    downloads: [], 
    pendingDownloads: [],
    queueSize: 0, 
    currentDownload: null,
  })
  
  const scrollX = useRef(new Animated.Value(0)).current
  
  const onPress = (manhwa: Manhwa) => {
    
  }

  const screens = [
    <ManhwaGrid
      onPress={onPress}
      manhwas={state.downloads}
      showsVerticalScrollIndicator={false}
      showManhwaStatus={false}
    />,
    <DownloadQueue state={state} />,
  ];  

  const refresh = async () => {
    await Promise.all([
      dbReadDownloadedManhwas(db),
      dbReadPendingDownloads(db),
      downloadManager.queueSize(),
      downloadManager.currentDownload()      
    ]).then(([downloads, pendingDownloads, queueSize, currentDownload]) => {
      setState({downloads, pendingDownloads, queueSize, currentDownload})
    })
  };

  useEffect(() => {
    refresh();
    const onProgress = () => refresh();
    const onQueueUpdate = () => refresh();

    downloadManager.on("progress", onProgress);
    downloadManager.on("queueUpdate", onQueueUpdate);

    return () => {
      downloadManager.off("progress", onProgress);
      downloadManager.off("queueUpdate", onQueueUpdate);
    };
  }, []);  

  return (
    <SafeAreaView style={AppStyle.safeArea} >
      <TopBar title='Downloads'>
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
          <ReturnButton/>
        </Row>
      </TopBar>
      <KeyboardAvoidingView style={{flex: 1}} behavior={Platform.OS === 'ios' ? 'padding' : 'height'} >
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
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    height: AppConstants.UI.BUTTON.SIZE,
    backgroundColor: Colors.primary,
    paddingHorizontal: AppConstants.UI.ITEM_PADDING.HORIZONTAL,
    borderRadius: AppConstants.UI.BORDER_RADIUS,
    justifyContent: "space-between"
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
