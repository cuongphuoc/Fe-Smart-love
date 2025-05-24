import { StyleSheet, View, Text, Image, TouchableOpacity, ScrollView } from 'react-native';
import { useFonts, PlayfairDisplay_700Bold } from '@expo-google-fonts/playfair-display';
import * as SplashScreen from 'expo-splash-screen';
import { useCallback, useEffect, useState } from 'react';
import { useRoute, useNavigation } from "@react-navigation/native";
import { API_URL } from "../../constants/Gloubal";
import AsyncStorage from '@react-native-async-storage/async-storage';
import Footer from '@/components/Footer';
SplashScreen.preventAutoHideAsync();

const formatDate = (dateString: any) => {
  const date = new Date(dateString);
  const day = date.getDate();
  const month = date.toLocaleString('default', { month: 'long' });
  const year = date.getFullYear();
  return `${day} ${month} ${year}`;
};

// Component tự động lấy tỉ lệ ảnh base64 và áp dụng aspectRatio
const AutoImage = ({ source }: { source: string }) => {
  const [aspectRatio, setAspectRatio] = useState<number>(1);

  useEffect(() => {
    Image.getSize(
    source,
    (width, height) => setAspectRatio((width / height)),
    () => setAspectRatio(0.5) // fallback
  );
  }, [source]);

  return (
    <Image
      source={{ uri: source }}
      style={[styles.headerImage, { aspectRatio }]}
      resizeMode="contain"
    />
  );
};

export default function TabTwoScreen() {
  const [triggerXoa, setTriggerXoa] = useState(false);
  const route = useRoute<any>();
  const navigation = useNavigation();
  const rawDate = route.params?.day || new Date().toISOString();
  const temp = route.params?.temp || 0;
  const temp1 = route.params?.temp1 || 0;

  const [fontsLoaded] = useFonts({ PlayfairBold: PlayfairDisplay_700Bold });
  const [diaryData, setDiaryData] = useState<any[]>([]);

  useEffect(() => {
    const checkAuthAndFetchData = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        if (!token) {
          navigation.navigate('login' as never);
          return;
        }

        const response = await fetch(`${API_URL}/api/diaries?date=${rawDate}`, {
          method: 'GET',
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();
        setDiaryData(data);
      } catch (error: any) {
        console.error('Error fetching diaries:', error.message);
      }
    };

    checkAuthAndFetchData();
  }, [rawDate, triggerXoa, temp, temp1]);

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) await SplashScreen.hideAsync();
  }, [fontsLoaded]);

  const handleEdit = (item: any) => {
    navigation.navigate('postdiary', { diary: item });
  };

  const handleDelete = async (id: string) => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        navigation.navigate('login' as never);
        return;
      }

      const res = await fetch(`${API_URL}/api/diaries/${id}`, {
        method: 'DELETE',
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        setDiaryData(prev => prev.filter(d => d._id !== id));
        setTriggerXoa(prev => !prev);
      }
    } catch (err) {
      console.log("Error deleting diary:", err);
    }
  };

  if (!fontsLoaded) return null;

  const DiaryItem = ({ item }: any) => (
    <View style={styles.diaryContainer}>
      <View style={styles.headerContainer}>
        <Text style={styles.dateText}>{item.date ? formatDate(item.date) : 'Unknown date'}</Text>
        <Text style={styles.loveText}>{item.dayCount || '500 days'}</Text>
      </View>

      <View style={styles.imageContainer}>
        {item.link_img ? (
          <AutoImage source={`data:image/jpeg;base64,${item.link_img}`} />
        ) : (
          <View style={styles.headerImagePlaceholder} />
        )}
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
        <Image source={require('@/assets/images/phai.png')} style={styles.avatar} />
      </View>

      <View style={styles.dashedLine} />
    </View>
  );

  return (
    <View style={{ flex: 1 }} onLayout={onLayoutRootView}>
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        {diaryData.length > 0 ? (
          diaryData.map((item, index) => <DiaryItem key={index} item={item} />)
        ) : (
          <Text style={styles.noDataText}>Không có dữ liệu nhật ký cho ngày này.</Text>
        )}
      </ScrollView>

      <View style={styles.addButtonWrapper}>
        <TouchableOpacity style={styles.addButton} onPress={() => navigation.navigate('postdiary')}>
          <Text style={styles.plusText}>+</Text>
        </TouchableOpacity>
      </View>
      <Footer/>
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
    height: undefined,
    borderRadius: 20,
  },
  headerImagePlaceholder: {
    width: '100%',
    height: 169,
    backgroundColor: '#f0f0f0',
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
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  addButtonWrapper: {
    position: 'absolute',
    bottom: 40,
    right: 30,
  },
  addButton: {
    backgroundColor: '#3B82F6',
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
    marginBottom:50
  },
  plusText: {
    fontSize: 32,
    color: 'white',
    lineHeight: 32,
  },
  noDataText: {
    textAlign: 'center',
    marginTop:40,
    fontSize: 16,
    color: '#888',
  },
});
