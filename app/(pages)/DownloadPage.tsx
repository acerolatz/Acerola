import React, { useEffect, useState } from "react";
import { Text, StyleSheet, View, SafeAreaView } from "react-native";
import { downloadManager } from "@/helpers/DownloadManager";
import { AppStyle } from "@/styles/AppStyle";
import TopBar from "@/components/TopBar";
import ReturnButton from "@/components/buttons/ReturnButton";
import { DownloadRequest, DownloadByManhwa, Manhwa } from "@/helpers/types";
import { Typography } from "@/constants/typography";
import Row from "@/components/util/Row";
import { Colors } from "@/constants/Colors";
import CustomActivityIndicator from "@/components/util/CustomActivityIndicator";
import { AppConstants } from "@/constants/AppConstants";
import { dbReadDownloadedManhwas } from "@/lib/database";
import { useSQLiteContext } from "expo-sqlite";
import ManhwaGrid from "@/components/grid/ManhwaGrid";
import Column from "@/components/util/Column";
import TextButton from "@/components/buttons/TextButton";


type DownloadState = {
  downloads: Manhwa[]
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


export default function DownloadPage() {

  const db = useSQLiteContext()
  
  const [state, setState] = useState<DownloadState>({
    downloads: [], 
    queueSize: 0, 
    currentDownload: null    
  })

  const refresh = async () => {
    await Promise.all([
      dbReadDownloadedManhwas(db),
      downloadManager.queueSize(),
      downloadManager.currentDownload()      
    ]).then(([downloads, queueSize, currentDownload]) => {
      setState({downloads, queueSize, currentDownload})
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


  const onPress = (manhwa: Manhwa) => {

  }

  return (
    <SafeAreaView style={AppStyle.safeArea} >
      <TopBar title="Downloads" >
        <ReturnButton/>
      </TopBar>
      <View style={{flex: 1, gap: AppConstants.UI.MARGIN}} >
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


        <ManhwaGrid
          onPress={onPress}
          manhwas={state.downloads}
          showsVerticalScrollIndicator={false}
          showManhwaStatus={false}
        />

      </View>

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
  }
});
