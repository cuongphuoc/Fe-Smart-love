import { StyleSheet, View, Text, Image, TouchableOpacity, ScrollView } from 'react-native';
import { useFonts, PlayfairDisplay_700Bold } from '@expo-google-fonts/playfair-display';
import * as SplashScreen from 'expo-splash-screen';
import { useCallback, useEffect, useState } from 'react';
import { useRoute } from "@react-navigation/native";

SplashScreen.preventAutoHideAsync();

const formatDate = (dateString: any) => {
  const date = new Date(dateString);
  const day = date.getDate();
  const month = date.toLocaleString('default', { month: 'long' });
  const year = date.getFullYear();
  return `${day} ${month} ${year}`;
};

export default function TabTwoScreen() {
  const [triggerXoa, setTriggerXoa] = useState(false);
  type RouteParams = { day?: string ,temp?:Int16Array };
  const route = useRoute<{ params: RouteParams }>();
  
  const rawDate = route.params?.day || new Date().toISOString();
  const temp= route.params?.temp || 0;

console.log(temp);
  const [fontsLoaded] = useFonts({ PlayfairBold: PlayfairDisplay_700Bold });
  const [diaryData, setDiaryData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`http://localhost:3000/api/diaries?date=${encodeURIComponent(rawDate)}`, {
          method: 'GET',
          headers: { Accept: 'application/json' }
        });

        const data = await response.json();
        console.log('Diary data:', data);
        setDiaryData(data);
      } catch (error: any) {
        console.error('Error fetching diaries:', error.message);
      }
    };
    fetchData();
  }, [rawDate,triggerXoa,temp]);
  

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) await SplashScreen.hideAsync();
  }, [fontsLoaded]);

  const handleEdit = (item: any) => {
    console.log("Editing diary:", item);
    // Ví dụ: navigation.navigate("EditDiary", { diary: item });
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`http://localhost:3000/api/diaries/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setDiaryData(prev => prev.filter((d: any) => d.id !== id));
        setTriggerXoa(prev => !prev); 
      } else {
        console.log("Delete failed");
      }
    } catch (err) {
      console.log("Error deleting diary:", err);
    }
  };
  

  if (!fontsLoaded) return null;

  const DiaryItem = ({ item }: any) => (
    <View style={styles.diaryContainer}>
      <View style={styles.headerContainer}>
        <Text style={styles.dateText}>
          {item.date ? formatDate(item.date) : 'Unknown date'}
        </Text>
        <Text style={styles.loveText}>{item.dayCount || '500 days'}</Text>
      </View>

      <View style={styles.imageContainer}>
        <Image
          source={item.link_img}
          style={styles.headerImage}
          resizeMode="cover"
        />
      </View>

      <Text style={styles.title}>{item.title || 'Untitled'}</Text>
      <Text style={styles.content}>{item.description || 'No content available.'}</Text>

      <View style={styles.actionButtons}>
        <TouchableOpacity style={styles.actionBtn} onPress={() => handleEdit(item)}>
          <Text style={styles.actionText}>✏️ Sửa</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn} onPress={() => handleDelete(item._id)}>
          <Text style={[styles.actionText, { color: 'red' }]}>🗑️ Xoá</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.avatarContainer}>
        <Text style={styles.author}>{item.author || 'Anonymous'}</Text>
        <Image
          source={require('@/assets/images/phai.png')}
          style={styles.avatar}
        />
      </View>
      

      <View style={styles.dashedLine} />
    </View>
  );

  return (
    <View style={{ flex: 1 }} onLayout={onLayoutRootView}>
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        {diaryData.map((item, index) => (
          <DiaryItem key={index} item={item} />
        ))}
      </ScrollView>

      <View style={styles.addButtonWrapper}>
        <TouchableOpacity style={styles.addButton}>
          <Text style={styles.plusText}>+</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  diaryContainer: {
    marginBottom: 30,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginVertical: 10,
  },
  dateText: {
    fontSize: 12,
    fontFamily: 'PlayfairBold',
    color: '#000',
  },
  loveText: {
    fontSize: 12,
    fontFamily: 'PlayfairBold',
    color: '#000',
  },
  imageContainer: {
    overflow: 'hidden',
    borderRadius: 20,
    marginHorizontal: 20,
  },
  headerImage: {
    width: '100%',
    height: 169,
    borderRadius: 20,
  },
  title: {
    textAlign: 'center',
    fontWeight: '500',
    fontSize: 12,
    paddingVertical: 10,
  },
  content: {
    textAlign: 'center',
    fontWeight: '300',
    fontSize: 12,
    paddingHorizontal: 30,
    color: '#000',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
    gap: 20,
  },
  actionBtn: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
  },
  actionText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#333',
  },
  avatarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingTop: 10,
    paddingRight: 20,
  },
  author: {
    fontWeight: '300',
    fontSize: 12,
    color: '#000',
  },
  avatar: {
    width: 40,
    height: 40,
    marginLeft: 5,
    borderRadius: 20,
  },
  dashedLine: {
    alignSelf: 'center',
    marginTop: 10,
    height: 1,
    width: '50%',
    borderBottomWidth: 2,
    borderBottomColor: '#ccc',
    borderStyle: 'dashed',
  },
  addButtonWrapper: {
    position: 'absolute',
    bottom: 20,
    right: 20,
  },
  addButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'white',
    borderWidth: 2,
    borderColor: '#FF5277',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 2, height: 2 },
  },
  plusText: {
    fontSize: 50,
    color: '#FF5277',
    fontWeight: '100',
    paddingBottom: 10,
  },
});
