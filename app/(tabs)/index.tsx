import { Image, StyleSheet, View, Text, FlatList, TouchableOpacity,ImageBackground } from 'react-native';
import { Svg, Path } from 'react-native-svg';


const events = [
  { id: '1', icon: '💕', title: 'Anniversary', days: 'D-10' },
  { id: '2', icon: '🎄', title: 'Christmas', days: 'D-25' },
];
const data = [
  { id: "1", title: "Cooking", image: require("@/assets/images/cook.png") },
  { id: "2", title: "Travel", image: require("@/assets/images/tra.png") },
  { id: "3", title: "Daily", image: require("@/assets/images/phai.png") },
];
export default function HomeScreen() {
  return (
    <View style={styles.container}>
      {/* Hình ảnh nền */}
      <View style={styles.imageWrapper}>
        <Image
          source={require('@/assets/images/my-image.png')}
          style={styles.headerImage}
        />

        {/* Trái tim và chữ */}
        <View style={styles.overlay}>
          <Svg width="100" height="95" viewBox="0 0 30 30">
            <Path
              d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
              fill="none"
              stroke="#ff69b4"
              strokeWidth="1"
            />
          </Svg>
          <Text style={styles.heartText}>500{'\n'}days</Text>
        </View>
      </View>

      {/* Danh sách sự kiện */}
      <FlatList
        style={{ maxHeight: 50 }}
        data={events}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.eventItem}>
            <Text style={styles.eventText}>
              {item.icon} {item.title}
              <Text style={styles.daysText}>{item.days}</Text>
            </Text>
          </View>
        )}
      />
      <Text style={{ textAlign: 'center' }}>Mood</Text>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%', paddingHorizontal: 10 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <View><Image source={require('@/assets/images/phai.png')} style={{ width: 100, height: 100, borderRadius: 50 }} />
            <Text style={{
              fontSize: 12,    // Giảm font size để không bị tràn
              color: '#000000',
              fontWeight: 'light', // Thay 'light' bằng 'bold' hoặc bỏ đi
              paddingBottom: 5,
              textAlign: "center",
              marginTop: 10,
              fontFamily: "IBM Plex Mono"
            }}>Ashley</Text>
          </View>

          <Image source={require('@/assets/images/phai.png')} style={{ width: 40, height: 40, marginLeft: 5, borderRadius: 20 }} />
          <Image source={require('@/assets/images/phai.png')} style={{ width: 40, height: 40, marginLeft: 5, borderRadius: 20 }} />
          <Image source={require('@/assets/images/phai.png')} style={{ width: 40, height: 40, marginLeft: 5, borderRadius: 20 }} />
          {/* Nút dấu cộng */}
          <TouchableOpacity style={{
            width: 40,
            height: 40,
            borderRadius: 25,
            backgroundColor: '#FFECE6', // Màu nền giống ảnh
            justifyContent: 'center',
            alignItems: 'center',
            marginLeft: 5,
          }}>
            <Text style={{
              fontSize: 24,    // Giảm font size để không bị tràn
              color: '#888',
              fontWeight: 'bold', // Thay 'light' bằng 'bold' hoặc bỏ đi
              paddingBottom: 5
            }}>+</Text>
          </TouchableOpacity>
        </View>
        <View>
          <Image source={require('@/assets/images/phai.png')} style={{ width: 100, height: 100, borderRadius: 50 }} />
          <Text style={{
            fontSize: 12,    // Giảm font size để không bị tràn
            color: '#000000',
            fontWeight: 'light', // Thay 'light' bằng 'bold' hoặc bỏ đi
            paddingBottom: 5,
            textAlign: "center",
            marginTop: 10,
            fontFamily: "IBM Plex Mono"
          }}>Ashley</Text>
        </View>
      </View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 20, marginTop: 20 }}>

        {/* Box 1 */}
        <View style={{
          width: 164,
          height: 181,
          backgroundColor: '#FFE4DD',
          borderRadius: 20,
          padding: 15,
          alignItems: 'center',
          marginRight: 20
        }}>
          <Text style={{
            color: '#fff',

            fontSize: 12,
            marginBottom: 10,
            textAlign: 'left',
            alignSelf: 'flex-start' // Căn trái chính xác
          }}>Total heart</Text>
          <View style={{ justifyContent: 'center', alignItems: 'center', paddingTop: 10 }}>
            <Svg width="80" height="80" viewBox="0 0 24 24">
              <Path
                d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
                fill="#FFF"
              />
            </Svg>
            <Text style={{ fontSize: 12, fontWeight: 'light', color: '#FFE6E0', position: 'absolute' }}>125</Text>
          </View>
          <View style={{ width: '100%', alignItems: 'flex-end', position: 'absolute', bottom: 10, right: 10 }}>
            <TouchableOpacity>
              <Text style={{ color: '#FFF', fontSize: 12, marginTop: 15 }}>View calendar ►</Text>
            </TouchableOpacity>
          </View>

        </View>

        {/* Box 2 */}
        <View style={{
          width: 164,
          height: 181,
          backgroundColor: '#A9A9A9',
          borderRadius: 20,
          padding: 15,
          alignItems: 'center'
        }}>
          <Text style={{
            color: '#fff',
            fontSize: 12,
            marginBottom: 10,
            textAlign: 'left',
            alignSelf: 'flex-start' // Căn trái chính xác
          }}>Today heart</Text>
          <View style={{ justifyContent: 'center', alignItems: 'center', paddingTop: 10 }}>
            <Svg width="80" height="80" viewBox="0 0 24 24">
              <Path
                d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
                fill="#FFE6E0"
              />
            </Svg>
            <Text style={{ fontSize: 12, fontWeight: 'light', color: '#333131E0', position: 'absolute' }}>+1</Text>

          </View>

          <View style={{ width: '100%', alignItems: 'flex-end', position: 'absolute', bottom: 10, right: 10 }}>
            <TouchableOpacity>
              <Text style={{ color: '#FFF', fontSize: 12, marginTop: 15 }}>Write diary ►</Text>
            </TouchableOpacity>
          </View>

        </View>
       
    </View>
     {/* Colletion */}
    <View style={{ padding: 10, backgroundColor: "#fff" } }>
    

      <Text style={{ fontSize: 9, fontWeight: "400", color: "#888", marginBottom: 10 ,marginLeft:20}}>Collection ►</Text>
      <FlatList
     style={{ backgroundColor: "#fff", paddingVertical: 0 }}
        data={data}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={{ marginRight: 10 }}>
            <ImageBackground
              source={item.image}
              style={{
                width: 127,
                height: 109,
                borderRadius: 20,
                overflow: "hidden",
                justifyContent: "flex-end",
                padding: 0,
              }}
              imageStyle={{ borderRadius: 20 }}
            >
              <Text
                style={{
                  color: "#000",
                  fontSize: 9,
                  fontWeight: "400",
                  backgroundColor: "rgba(255, 255, 255, 0.7)",
                  paddingHorizontal: 20,
                  borderRadius: 5,
                }}
              >
                {item.title}
              </Text>
            </ImageBackground>
          </View>
        )}
      />
    </View>
    <View
  style={{
    position: "absolute",
    bottom: 0,
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
  imageRow: {
    flexDirection: 'row', // Sắp xếp ảnh theo chiều ngang
    justifyContent: 'space-between', // Căn đều hai ảnh
    alignItems: 'center', // Căn giữa theo trục dọc
    marginTop: 10, // Khoảng cách giữa danh sách và ảnh
    width: '100%', // Đảm bảo chiếm hết chiều ngang
  },
  image: {
    width: 150,
    height: 150,
    //resizeMode: 'contain', // Giữ tỷ lệ ảnh
    borderRadius: "100%",
  },
  imagechild: {
    width: 100,
    height: 100,
    //resizeMode: 'contain', // Giữ tỷ lệ ảnh
    borderRadius: "100%",
  },

  container: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  imageWrapper: {
    width: "100%",
    height: 169,
    borderRadius: 20,
    overflow: 'hidden',
    
  },
  headerImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  overlay: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -40 }, { translateY: -37.5 }],
    alignItems: 'center',
    justifyContent: 'center',
  },
  heartText: {
    position: 'absolute',
    top: 18,
    left: 25,
    fontSize: 14,
    fontWeight: 'normal',
    color: '#ff69b4',
    textAlign: 'center',
  },
  eventItem: {
    width: '100%',
    paddingVertical: 2,
    borderBottomWidth: 0.5,
    borderBottomColor: '#ccc',
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderStyle: 'dashed',
  },
  eventText: {
    fontSize: 10,
  },
  daysText: {
    color: '#999',
    marginLeft: 100
  },
});