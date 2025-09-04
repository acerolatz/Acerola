import { 
  View, 
  SafeAreaView, 
  Animated, 
  KeyboardAvoidingView, 
  Platform 
} from "react-native";
import { dbReadDownloadedManhwas, dbReadPendingDownloadsByManhwa } from "@/lib/database";
import ReturnButton from "@/app/components/buttons/ReturnButton";
import DownloadQueue from "../components/download/DownloadQueue";
import { downloadManager } from "@/helpers/DownloadManager";
import React, { useEffect, useRef, useState } from "react";
import { AppConstants } from "@/constants/AppConstants";
import { DownloadState } from "@/helpers/types";
import { useSQLiteContext } from "expo-sqlite";
import { AppStyle } from "@/styles/AppStyle";
import TopBar from "@/app/components/TopBar";
import Row from "@/app/components/util/Row";
import DownloadGrid from "../components/grid/DownloadGrid";


const DownloadPage = () => {

  const db = useSQLiteContext()
  const [state, setState] = useState<DownloadState>({
    downloads: [], 
    pendingDownloads: [],
    queueSize: 0, 
    currentDownload: null,
  })
  
  const scrollX = useRef(new Animated.Value(0)).current
  
  const screens = [
    <DownloadGrid manhwas={state.downloads} />,
    <DownloadQueue state={state} />,
  ];  

  const refresh = async () => {
    await Promise.all([
      dbReadDownloadedManhwas(db),
      dbReadPendingDownloadsByManhwa(db),
      downloadManager.queueSize(),
      downloadManager.currentDownload()      
    ]).then(([downloads, pendingDownloads, queueSize, currentDownload]) => {
      setState({downloads, pendingDownloads, queueSize, currentDownload})
    })
  };

  useEffect(() => {
    refresh()
    const onQueueUpdate = () => refresh()
    downloadManager.on("progress", onQueueUpdate)
    downloadManager.on("queueUpdate", onQueueUpdate)
    return () => {
      downloadManager.off("progress", onQueueUpdate)
      downloadManager.off("queueUpdate", onQueueUpdate)
    };
  }, []);

  return (
    <SafeAreaView style={AppStyle.safeArea} >
      <TopBar title='Downloads'>
        <Row style={AppStyle.gap} >
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
          <ReturnButton/>
        </Row>
      </TopBar>
      <KeyboardAvoidingView style={AppStyle.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'} >
        <View style={AppStyle.flex}>
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
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

export default DownloadPage