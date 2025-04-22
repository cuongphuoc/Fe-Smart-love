import { View, Text, Image, TouchableOpacity, TextInput, Alert } from 'react-native';
import { useState, useCallback } from 'react';
import { FontAwesome } from "@expo/vector-icons";
import { useNavigation, NavigationProp } from "@react-navigation/native";
import * as ImagePicker from 'expo-image-picker';
import { useRoute } from "@react-navigation/native";
import axios from "axios";

// Định nghĩa kiểu cho tham số route
type RouteParams = {
  day?: string;
};
let temp=1;
// Định nghĩa kiểu cho đối tượng navigation (nếu bạn có các screen cụ thể)
type RootStackParamList = {
  CalendarScreen: undefined;
  // Thêm các screen khác của bạn vào đây nếu cần
};

type SelectedImageInfo = {
  uri: string | null;
  name: string | null;
  type: string | null;
};

export default function ProfileScreen() {
  const route = useRoute<{ params: RouteParams }>();
  const rawDate = route.params?.day || new Date().toISOString();

  const formatDate = useCallback((isoDate: string): string => {
    return new Date(isoDate).toLocaleDateString("en-GB", {
      weekday: "short",
      day: "numeric",
      month: "long",
      year: "numeric"
    });
  }, []);

  const date = formatDate(rawDate);
  console.log(date);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedImageInfo, setSelectedImageInfo] = useState<SelectedImageInfo>({ uri: null, name: null, type: null });
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  const handleImageSelection = useCallback(async (source: 'library' | 'camera') => {
    const permissionResult = source === 'library'
      ? await ImagePicker.requestMediaLibraryPermissionsAsync()
      : await ImagePicker.requestCameraPermissionsAsync();

    if (!permissionResult.granted) {
      Alert.alert("Lỗi", `Ứng dụng cần quyền truy cập ${source === 'library' ? 'thư viện ảnh' : 'camera'}!`);
      return;
    }

    const result = source === 'library'
      ? await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, quality: 1 })
      : await ImagePicker.launchCameraAsync({ allowsEditing: true, quality: 1 });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const asset = result.assets[0];
      setSelectedImageInfo({
        uri: asset.uri,
        name: asset.fileName || `upload.${asset.uri.split(".").pop()}`,
        type: asset.type || `image/${asset.uri.split(".").pop()}`,
      });
    } else {
      setSelectedImageInfo({ uri: null, name: null, type: null });
    }
  }, []);

  const handlePost = useCallback(async () => {
    if (!title || !description) {
      Alert.alert("Lỗi", "Vui lòng nhập tiêu đề và mô tả!");
      return;
    }
  
    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
   formData.append("uri",selectedImageInfo.uri??"");
    formData.append("name",selectedImageInfo.name?? "upload.jpg");
    formData.append("type",selectedImageInfo.type ?? "image/jpeg");
    formData.append("date",rawDate);
  //  console.log(selectedImageInfo.type==="image")
    if (selectedImageInfo.type==="image") {
formData.append("uri",selectedImageInfo.uri??"");
formData.append("name",selectedImageInfo.name?? "upload.jpg");
formData.append("type",selectedImageInfo.type ?? "image/jpeg");
const temp=true;
formData.append("kind","true");
      console.log(selectedImageInfo.type);
      /*const imageFile = {
        uri: selectedImageInfo.uri,
        name: selectedImageInfo.name ?? "upload.jpg",
        type: selectedImageInfo.type ?? "image/jpeg",
      };
      formData.append("image", {
        uri: selectedImageInfo.uri!,
        name: selectedImageInfo.name || "photo.jpg",
        type: selectedImageInfo.type || "image/jpeg"
      } as any);
      console.log("Sending image:", selectedImageInfo);
console.log("URI:", selectedImageInfo.uri);*/


    }
  
    try {
      // Debug rõ ràng hơn
      console.log("Uploading diary:", { title, description, hasImage: !!selectedImageInfo.uri });
  
      const response = await axios.post(
        "http://localhost:3000/api/diaries/test", // Thay bằng địa chỉ IP nếu chạy thiết bị thật
        formData,
        {
          headers: {
            
            Accept: "application/json",
          
            
          },
        }
      );
  
      if (response.status === 200) {
        Alert.alert("Thành công", `Nhật ký "${title}" đã được đăng!`);
console.log(response.data)
temp++;
navigation.navigate("viewdiary",{day:rawDate,temp:temp});
        setTitle("");
        setDescription("");
        setSelectedImageInfo({ uri: null, name: null, type: null });
      } else {
        console.log("Lỗi server:", response.data);
        throw new Error(response.data?.message || "Tải nhật ký thất bại.");
      }
    } catch (error: any) {
      console.error("Lỗi khi gửi:", error);
      Alert.alert("Lỗi", `Không thể tải lên, vui lòng thử lại!\n${error?.message || ""}`);
    }
  }, [title, description, selectedImageInfo,date]);
  const handleDescriptionChange = (text: string) => {
    const formatted = text.replace(/(.{100})/g, '$1\n'); // thêm \n sau mỗi 100 ký tự
    setDescription(formatted);
  };

  return (
    <View>
      <Text style={{ textAlign: "center", paddingTop: 20, fontWeight: '400', fontSize: 30, fontFamily: "Playfair Display" }}>
        Write a Diary
      </Text>

      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <Image
          source={require('@/assets/images/phai.png')}
          style={{ width: 40, height: 40, borderRadius: 20, marginLeft: 30 }}
        />
        <TouchableOpacity onPress={() => navigation.navigate("CalendarScreen")}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Text style={{ fontSize: 13, fontFamily: "Playfair Display", fontWeight: "500", textAlign: "center", marginLeft: 90, marginRight: 10 }}>
              {date}
            </Text>
            <Text style={{ color: "#F88585" }}>▼</Text>
          </View>
        </TouchableOpacity>
      </View>

      <View style={{ padding: 20 }}>
        <TextInput
          placeholder="Title"
          placeholderTextColor="#000"
          style={{ height: 70, borderWidth: 1, borderColor: "red", borderRadius: 10, paddingHorizontal: 10, fontSize: 16, textAlignVertical: "top", backgroundColor: "#fff" }}
          value={title}
          onChangeText={setTitle}
        />
      </View>


      <View style={{ paddingHorizontal: 20 }}>
        <TextInput
          placeholder="Description"
          placeholderTextColor="#000"
          style={{ height: 102, borderWidth: 1, borderColor: "red", borderRadius: 10, paddingHorizontal: 10, fontSize: 16, textAlignVertical: "top", backgroundColor: "#fff" }}
          value={description}
          onChangeText={setDescription}
        />
      </View>

      {/* Thanh công cụ */}
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 10 }}>
        <View style={{ flexDirection: "row", gap: 15, paddingHorizontal: 20 }}>
          <TouchableOpacity onPress={() => handleImageSelection('library')}>
            <FontAwesome name="image" size={24} color="#EE1D52B0" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleImageSelection('camera')}>
            <FontAwesome name="camera" size={24} color="#EE1D52B0" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={{ backgroundColor: "#EE1D52B0", paddingVertical: 8, paddingHorizontal: 20, borderRadius: 20, marginRight: 10 }}
          onPress={handlePost}
        >
          <Text style={{ color: "white", fontWeight: "bold" }}>Post</Text>
        </TouchableOpacity>
      </View>

      {/* Hiển thị ảnh đã chọn */}
      {selectedImageInfo.uri && (
        <View style={{ alignItems: "center", marginTop: 10 }}>
          <Image source={{ uri: selectedImageInfo.uri }} style={{ width: 100, height: 100, borderRadius: 10 }} />
        </View>
      )}
    </View>
  );
}
