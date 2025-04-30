import { View, Text, Image, TouchableOpacity, TextInput, Alert } from 'react-native';
import { useState, useCallback ,useEffect } from 'react';
import { FontAwesome } from "@expo/vector-icons";
import { useNavigation, NavigationProp } from "@react-navigation/native";
import * as ImagePicker from 'expo-image-picker';
import { useRoute } from "@react-navigation/native";
import axios from "axios";

// Định nghĩa kiểu cho tham số route
type RouteParams = {
  day?: string;
  diary:any;
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
  const rawDate =route.params?.diary?.date||route.params?.day || new Date().toISOString();
 const edit =route.params?.diary||null;
 const [isEdit, setisEdit] = useState(false);
 
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
  useEffect(() => {
    if (edit) {
      // Set the image information if edit has an image link
      if (edit.link_img) {
        setSelectedImageInfo({
          uri: edit.link_img,
          name: 'image', // You can adjust this according to your requirement
          type: 'image/jpeg' // Or use the correct image type
        });
      }

      // Set the title and description if they are available in edit
      setTitle(edit.title || ""); // Fallback to empty string if title is undefined
      setDescription(edit.description || ""); // Fallback to empty string if description is undefined
    }
  }, [edit]);
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
    formData.append("uri", selectedImageInfo.uri ?? "");
    formData.append("name", selectedImageInfo.name ?? "upload.jpg");
    formData.append("type", selectedImageInfo.type ?? "image/jpeg");
    formData.append("date", rawDate);

    if (selectedImageInfo.type === "image") {
      formData.append("uri", selectedImageInfo.uri ?? "");
      formData.append("name", selectedImageInfo.name ?? "upload.jpg");
      formData.append("type", selectedImageInfo.type ?? "image/jpeg");
      const temp = true;
      formData.append("kind", "true");
      console.log("Image type:", selectedImageInfo.type);
    }

    // Ghi log dữ liệu gửi đi
    console.log("Post Data:", {
      title,
      description,
      selectedImageInfo,
      rawDate
    });

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
        console.log(response.data);
        temp++;
        navigation.navigate("viewdiary", { day: rawDate, temp: temp });
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
  }, [title, description, selectedImageInfo, date]);
  const handleEdit = useCallback(async () => {
    if (!title || !description) {
      Alert.alert("Lỗi", "Vui lòng nhập tiêu đề và mô tả!");
      return;
    }
    console.log(123)
  
    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    if(!edit){
    formData.append("uri", selectedImageInfo.uri ?? "");
    formData.append("name", selectedImageInfo.name ?? "upload.jpg");
    
    formData.append("type", selectedImageInfo.type ?? "image/jpeg");
    }
    formData.append("date", rawDate);
  
    // Additional check for image type
    if (selectedImageInfo.type === "image") {
      formData.append("uri", selectedImageInfo.uri ?? "");
      formData.append("name", selectedImageInfo.name ?? "upload.jpg");
      formData.append("type", selectedImageInfo.type ?? "image/jpeg");
      formData.append("kind", "true");
      formData.append("diaryId",edit.id_diary);
      console.log("Image type:", selectedImageInfo.type);
    }else{
      formData.append("img_link", edit.link_img?? "");
      formData.append("name", edit.name ?? "upload.jpg");
      formData.append("type", edit.type ?? "image/jpeg");
      formData.append("kind", "true");
      formData.append("diaryId",edit.id_diary);
      console.log("Image type:",edit.type);
    }
  
    // Log the data to be posted
    console.log("Edit Data:", {
      title,
      description,
      selectedImageInfo,
      rawDate,
    });
  
    try {
      // Ensure edit mode is active and we have an ID to update
      if (edit && edit._id) {
        console.log(edit.id_diary)
        const response = await axios.put(
          `http://localhost:3000/api/diaries`, // Assuming you have an `id` for editing
          formData,
          {
            headers: {
              Accept: "application/json",
            },
          }
        );
  
        if (response.status === 200) {
          console.log(234)
          Alert.alert("Thành công", `Nhật ký "${title}" đã được cập nhật!`);
          console.log(response.data);
          temp++;
          navigation.navigate("viewdiary", { day: rawDate, temp: temp});
          setTitle("");
          setDescription("");
          setSelectedImageInfo({ uri: null, name: null, type: null });
        } else {
          console.log("Lỗi server:", response.data);
          throw new Error(response.data?.message || "Cập nhật nhật ký thất bại.");
        }
      } else {
        Alert.alert("Lỗi", "Không tìm thấy nhật ký cần sửa!");
      }
    } catch (error: any) {
      console.error("Lỗi khi gửi:", error);
      Alert.alert("Lỗi", `Không thể cập nhật, vui lòng thử lại!\n${error?.message || ""}`);
    }
  }, [title, description, selectedImageInfo, rawDate, edit]);
  
  
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
  onPress={edit ? handleEdit : handlePost} // Conditionally call handleEdit or handlePost
>
  <Text style={{ color: "white", fontWeight: "bold" }}>
    {edit ? "Edit" : "Post"} {/* Conditionally change text */}
  </Text>
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
