import { StyleSheet, View, Text, Image ,TouchableOpacity} from 'react-native';
import { useFonts, PlayfairDisplay_700Bold } from '@expo-google-fonts/playfair-display';
import * as SplashScreen from 'expo-splash-screen';
import { useCallback } from 'react';

// Giữ màn hình chờ cho đến khi font load xong
SplashScreen.preventAutoHideAsync();

export default function TabTwoScreen() {
  const [fontsLoaded] = useFonts({
    PlayfairBold: PlayfairDisplay_700Bold,
  });

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) {
      await SplashScreen.hideAsync(); // Ẩn màn hình chờ sau khi font load
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null; // Không hiển thị gì nếu font chưa load
  }

  return (
    <View style={{ flex: 1 }} onLayout={onLayoutRootView}>
      {/* Phần hiển thị ngày và số ngày yêu nhau */}
      <View style={styles.headerContainer}>
        <Text style={styles.dateText}>15th March 2025</Text>
        <Text style={styles.loveText}>500 days in love</Text>
      </View>

      {/* Ảnh nền */}
      <View style={styles.imageContainer}>
        <Image
          source={require('@/assets/images/anhnen.png')} // Đường dẫn đến ảnh
          style={styles.headerImage}
        />
      </View>
      {/* Text va avarta */}
      <View >
        <Text style={{
          textAlign: 'center', fontFamily: "", paddingVertical: 10, fontWeight:
            '500', fontSize: 12
        }}>Blue sky</Text>
        <Text style={{
          textAlign: 'center', fontFamily: "", fontWeight:
            "300", fontSize: 12, paddingHorizontal: 30, color: "#000"
        }}>Today was a good day! First of all I set off with my friends (Ratty and Toad) to try and find Badger but what we didn’t know was that he was at toad hall sleeping. His snore was so loud it broke all of the windows and somehow made toad an insomniac for the rest of his life. Toad, who was excited, ran into the woods and started to roll around in the leaves</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', paddingTop: 10, paddingRight: 20 }}>
          <Text style={{
            textAlign: 'center', fontFamily: "", fontWeight:
              300, fontSize: 12, color: "#000"
          }}>Ashley</Text>
          <Image
            source={require('@/assets/images/phai.png')}
            style={{ width: 40, height: 40, marginLeft: 5, borderRadius: 20 }}
          />

        </View>

        <View style={{
          alignSelf: 'center', // Căn giữa
          marginTop: 10,
          height: 1,
          width: '50%', // Điều chỉnh độ dài của gạch
          backgroundColor: 'transparent', // Ẩn màu nền
          borderBottomWidth: 2, // Độ dày nét
          borderBottomColor: '#ccc', // Màu sắc
          borderStyle: 'dashed', // Nét đứt
        }} />
{/*"== moi "*/}
{/* Phần hiển thị ngày và số ngày yêu nhau */}
<View style={styles.headerContainer}>
        <Text style={styles.dateText}>15th March 2025</Text>
        <Text style={styles.loveText}>500 days in love</Text>
      </View>

      {/* Ảnh nền */}
      <View style={styles.imageContainer}>
        <Image
          source={require('@/assets/images/anhnen.png')} // Đường dẫn đến ảnh
          style={styles.headerImage}
        />
      </View>
      {/* Text va avarta */}
      <View >
        <Text style={{
          textAlign: 'center', fontFamily: "", paddingVertical: 10, fontWeight:
            '500', fontSize: 12
        }}>Blue sky</Text>
        <Text style={{
          textAlign: 'center', fontFamily: "", fontWeight:
            "300", fontSize: 12, paddingHorizontal: 30, color: "#000"
        }}>Today was a good day! First of all I set off with my friends (Ratty and Toad) to try and find Badger but what we didn’t know was that he was at toad hall sleeping. His snore was so loud it broke all of the windows and somehow made toad an insomniac for the rest of his life. Toad, who was excited, ran into the woods and started to roll around in the leaves</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', paddingTop: 10, paddingRight: 20 }}>
          <Text style={{
            textAlign: 'center', fontFamily: "", fontWeight:
              300, fontSize: 12, color: "#000"
          }}>Ashley</Text>
          <Image
            source={require('@/assets/images/phai.png')}
            style={{ width: 40, height: 40, marginLeft: 5, borderRadius: 20 }}
          />

        </View>

        <View style={{
          alignSelf: 'center', // Căn giữa
          marginTop: 10,
          height: 1,
          width: '50%', // Điều chỉnh độ dài của gạch
          backgroundColor: 'transparent', // Ẩn màu nền
          borderBottomWidth: 2, // Độ dày nét
          borderBottomColor: '#ccc', // Màu sắc
          borderStyle: 'dashed', // Nét đứt
        }} />

      </View>
      {/*"== moi "*/}
      
      </View>
      <View
        style={{
          position: "absolute",
          bottom: 20,
          right: 0,
        }}
      >
        <TouchableOpacity
          style={{
            width: 60,
            height: 60,
            borderRadius: 30,
            backgroundColor: "white",
            borderWidth: 2,
            borderColor: "#FF5277",
            justifyContent: "center",
            alignItems: "center",
            shadowColor: "#000",
            shadowOpacity: 0.1,
            shadowOffset: { width: 2, height: 2 },
          }}
        >
          <Text style={{ fontSize: 50, color: "#FF5277", fontWeight: "100", paddingBottom:10 }}>+</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
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
    fontWeight: 100
  },
  loveText: {
    fontSize: 12,
    fontFamily: 'PlayfairBold',
    color: '#000',
    fontWeight: 100
  },
  imageContainer: {
    overflow: 'hidden', // Đảm bảo borderRadius hoạt động
    borderRadius: 20, // Bo góc cho View cha

  },
  headerImage: {
    width: '100%',
    height: 169,

  },
});
