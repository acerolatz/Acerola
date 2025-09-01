import React, { useCallback, useEffect, useState } from "react";
import { Text, FlatList, StyleSheet, View, SafeAreaView } from "react-native";
import { downloadManager } from "@/helpers/DownloadManager";
import { databaseManager } from "@/lib/downloadDatabase";
import { AppStyle } from "@/styles/AppStyle";
import TopBar from "@/components/TopBar";
import ReturnButton from "@/components/buttons/ReturnButton";
import { DownloadRecord, DownloadRequest } from "@/helpers/types";
import { Typography } from "@/constants/typography";
import Row from "@/components/util/Row";
import Column from "@/components/util/Column";
import Button from "@/components/buttons/Button";
import { Colors } from "@/constants/Colors";
import CustomActivityIndicator from "@/components/util/CustomActivityIndicator";
import { AppConstants } from "@/constants/AppConstants";
import Footer from "@/components/util/Footer";


type DownloadState = {
  downloads: DownloadRecord[]
  queueSize: number
  currentDownload: DownloadRequest | null
}


const CurrentDownloadItem = ({item}: {item: DownloadRequest}) => {
  return (
    <Row style={styles.container}>
      <Column>
        <Text style={Typography.semiboldBlack}>{item.manhwa_name}</Text>
        <Text style={Typography.regularBlack}>Chapter {item.chapter.chapter_name} [downloading]</Text>
      </Column>
      <CustomActivityIndicator color={Colors.backgroundColor} />
    </Row>
  )
}


interface ItemProps {
  download: DownloadRecord
  setState: React.Dispatch<React.SetStateAction<DownloadState>>  
}


const Item = ({download, setState}: ItemProps) => {

  const [loading, setLoading] = useState(false)

  const deleteItem = useCallback(async () => {
    setLoading(true)
    await databaseManager.deleteDownload(download.manhwa_id, download.chapter_id)
    setState(prev => {return {
      ...prev,
      downloads: prev.downloads.filter(i => i.manhwa_id != download.manhwa_id && i.chapter_id && download.chapter_id)
    }})    
    setLoading(false)
  }, [download.path])

  return (
    <Row style={styles.container}>
      <Column>
        <Text style={Typography.semiboldBlack}>{download.manhwa_name}</Text>
        <Text style={Typography.regularBlack}>Chapter {download.chapter_name} [{download.status}]</Text>
      </Column>
      {
        loading || download.status == 'downloading' ?
        <CustomActivityIndicator color={Colors.backgroundColor} /> :
        <Button onPress={deleteItem} iconName="trash-outline" iconColor={Colors.backgroundColor} />        
      }
    </Row>
  )
}


export default function DownloadStatusScreen() {

  const [state, setState] = useState<DownloadState>({downloads: [], queueSize: 0, currentDownload: null})  

  const refresh = async () => {
    await Promise.all([
      databaseManager.getAllCompletedDownloads(),
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


  const renderItem = useCallback(
    ({item}: {item: DownloadRecord}) => <Item download={item} setState={setState} />, 
    []
  )

  const renderFooter = useCallback(() => <Footer/>, [])

  return (
    <SafeAreaView style={AppStyle.safeArea} >
      <TopBar title="Downloads" >
        <ReturnButton/>
      </TopBar>
      <View style={{flex: 1, gap: AppConstants.UI.GAP}} >
        <Text style={Typography.semibold}>On Queue: {state.queueSize}</Text>
        {state.currentDownload && <CurrentDownloadItem item={state.currentDownload} />}
        
        <FlatList
          data={state.downloads}
          keyExtractor={(item) => item.chapter_id.toString()}
          renderItem={renderItem}
          ListFooterComponent={renderFooter}
        />
      </View>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    ...AppStyle.defaultGridItem,
    justifyContent: "space-between",
    marginBottom: AppConstants.UI.MARGIN
  }
});
