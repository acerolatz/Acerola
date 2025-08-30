// src/screens/DownloadStatusScreen.tsx
import React, { useEffect, useState } from "react";
import { View, Text, FlatList, Button, StyleSheet, SafeAreaView } from "react-native";
import { ProgressBar } from "@react-native-community/progress-bar-android";
import { downloadManager } from "@/helpers/DownloadManager";
import { databaseManager } from "@/lib/downloadDatabase";
import { AppStyle } from "@/styles/AppStyle";
import TopBar from "@/components/TopBar";
import ReturnButton from "@/components/buttons/ReturnButton";

export default function DownloadStatusScreen() {
  const [downloads, setDownloads] = useState<any[]>([]);

  const refresh = async () => {
    const all = await databaseManager.getAllDownloads();
    setDownloads(all);
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
      <TopBar title="Downloads" >
        <ReturnButton/>
      </TopBar>

      <FlatList
        data={downloads}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text style={styles.text}>{item.manhwaId} - Capítulo {item.chapterId}</Text>
            <Text>Status: {item.status}</Text>
            <ProgressBar
              styleAttr="Horizontal"
              progress={item.progress || 0}
              indeterminate={false}
            />
          </View>
        )}
      />
      
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#fff" },
  title: { fontSize: 20, fontWeight: "bold", marginBottom: 10 },
  item: { marginBottom: 15, borderBottomWidth: 1, borderColor: "#ddd", paddingBottom: 8 },
  text: { fontSize: 16, fontWeight: "500" },
  actions: { flexDirection: "row", gap: 10, marginTop: 5 },
});
