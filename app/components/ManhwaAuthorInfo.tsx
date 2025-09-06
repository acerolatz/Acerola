import { FlatList, Pressable, StyleSheet, Text } from "react-native"
import { useCallback, useEffect, useRef, useState } from "react"
import { Manhwa, ManhwaAuthor } from "@/helpers/types"
import { dbReadManhwaAuthors } from "@/lib/database"
import { Typography } from "@/constants/typography"
import { useSQLiteContext } from "expo-sqlite"
import { AppStyle } from "@/styles/AppStyle"
import { Colors } from "@/constants/Colors"
import { useRouter } from "expo-router"
import Row from "./util/Row"


interface ManhwaAuthorInfoProps {
  manhwa: Manhwa
}


const ManhwaAuthorInfo = ({manhwa}: ManhwaAuthorInfoProps) => {
  
  const db = useSQLiteContext()  
  const router = useRouter()
  const [authors, setAuthors] = useState<ManhwaAuthor[]>([])
  const flatListRef = useRef<FlatList>(null)  
  
  useEffect(
    () => {
      async function init() {
        await dbReadManhwaAuthors(db, manhwa!.manhwa_id).then(values => setAuthors(values))
        flatListRef.current?.scrollToIndex({animated: false, index: 0})
      }
      init()
    }, 
    [db, manhwa]
  )
  
  const openAuthorPage = (author: ManhwaAuthor) => {
    router.push({
      pathname: '/(pages)/ManhwaByAuthor',
      params: {
        author_id: author.author_id,
        author_name: author.name, 
        author_role: author.role
    }})
  }

  const renderItem = useCallback(({item}: {item: ManhwaAuthor}) => (
    <Pressable style={styles.item} onPress={() => openAuthorPage(item)}>
      <Text style={Typography.regular} >
        {item.role == "Author" ? "Story" : "Art"}: {item.name}
      </Text>
    </Pressable>
  ), [])

  const KeyExtractor = useCallback((item: ManhwaAuthor) => item.author_id.toString(), [])

  return (
    <Row style={styles.container} >
      <FlatList
        data={authors}
        ref={flatListRef}
        keyExtractor={KeyExtractor}
        horizontal={true}
        showsHorizontalScrollIndicator={false}
        renderItem={renderItem}
      />
    </Row>
  )
}

export default ManhwaAuthorInfo;


const styles = StyleSheet.create({
  container: {
    width: '100%'
  },
  item: {
    ...AppStyle.defaultGridItem,
    backgroundColor: Colors.backgroundSecondary
  }
})