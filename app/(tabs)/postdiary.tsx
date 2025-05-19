import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, TextInput, Alert, StyleSheet, ScrollView } from 'react-native';
import { FontAwesome } from "@expo/vector-icons";
import { useNavigation, NavigationProp } from "@react-navigation/native";
import * as ImagePicker from 'expo-image-picker';
import { useRoute } from "@react-navigation/native";
import axios from "axios";
import { API_URL } from "../../constants/Gloubal";
import AsyncStorage from '@react-native-async-storage/async-storage';
import Footer from '@/components/Footer';
// Định nghĩa kiểu cho tham số route
type RouteParams = {
    day?: string;
    diary: any;
};

// Định nghĩa kiểu cho đối tượng navigation
type RootStackParamList = {
    CalendarScreen: undefined;
    viewdiary: { day: string; temp?: number; temp1?: number }; // Thêm viewdiary screen với tham số
    // Thêm các screen khác của bạn vào đây nếu cần
};

type SelectedImageInfo = {
    uri: string | null;
    name: string | null;
    type: string | null;
    base64: string | null;
};

export default function ProfileScreen() {
    const route = useRoute<{ params: RouteParams }>();
    const rawDate = route.params?.diary?.date || route.params?.day || new Date().toISOString();
    const edit = route.params?.diary || null;
    const formatDate = useCallback((isoDate: string): string => {
        return new Date(isoDate).toLocaleDateString("en-GB", {
            weekday: "short",
            day: "numeric",
            month: "long",
            year: "numeric"
        });
    }, []);

    const date = formatDate(rawDate);

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [selectedImageInfo, setSelectedImageInfo] = useState<SelectedImageInfo>({ uri: null, name: null, type: null, base64: null });
    const navigation = useNavigation<NavigationProp<RootStackParamList>>();

    useEffect(() => {
        if (edit) {
            setTitle(edit.title || "");
            setDescription(edit.description || "");
            setSelectedImageInfo({
                base64: null,
                uri: edit.link_img || null,
                name: edit.name || null,
                type: edit.type || null
            });
        } else {
            setTitle("");
            setDescription("");
            setSelectedImageInfo({ uri: null, name: null, type: null, base64: null });
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
            ? await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, quality: 0.8, base64: true })
            : await ImagePicker.launchCameraAsync({ allowsEditing: true, quality: 0.8, base64: true });

        if (!result.canceled && result.assets && result.assets.length > 0) {
            const asset = result.assets[0];
            setSelectedImageInfo({
                base64: asset.base64 || null,
                uri: asset.uri,
                name: asset.fileName || `upload.${asset.uri.split(".").pop()}`,
                type: asset.type || `image/${asset.uri.split(".").pop()}`,
            });
        } else {
            setSelectedImageInfo({ uri: null, name: null, type: null, base64: null });
        }
    }, []);

    const handlePost = useCallback(async () => {
        if (!title || !description) {
            Alert.alert("Lỗi", "Vui lòng nhập tiêu đề và mô tả!");
            return;
        }

        const data = {
            title: title,
            description: description,
            date: rawDate,
            kind: true, // hoặc false tùy theo giá trị thực tế
            link_img: selectedImageInfo.base64 || null,
        };

        try {
            console.log("Uploading diary:", { ...data, hasImage: !!selectedImageInfo.base64 });

            const response = await axios.post(`${API_URL}/api/diaries`, data, {
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json",
                    'Authorization': `Bearer ${await AsyncStorage.getItem('token')}`,
                },
            });

            if (response.status === 200 || response.status === 201) {
                Alert.alert("Thành công", `Nhật ký "${title}" đã được đăng!`);
                navigation.navigate("viewdiary", { day: rawDate, temp: Math.random() });
                setTitle("");
                setDescription("");
                setSelectedImageInfo({ uri: null, name: null, type: null, base64: null });
            } else {
                console.log("Lỗi server:", response.data);
                throw new Error(response.data?.message || "Tải nhật ký thất bại.");
            }
        } catch (error) {
            console.error("Lỗi khi gửi:", error);
            Alert.alert("Lỗi", `Không thể tải lên, vui lòng thử lại!\n${error?.message || ""}`);
        }
    }, [title, description, selectedImageInfo, rawDate, navigation]);

    const handleEdit = useCallback(async () => {
        if (!title || !description) {
            Alert.alert("Lỗi", "Vui lòng nhập tiêu đề và mô tả!");
            return;
        }

        const data = {
            title: title,
            description: description,
            date: rawDate,
            id_diary: edit.id_diary,
            kind: "true", // Update this according to your needs
            link_img: selectedImageInfo.base64 || null, // Send the base64 image if available
        };

        try {
            if (edit && edit.id_diary) {
                const response = await axios.put(
                    `${API_URL}/api/diaries/`,
                    data,
                    {
                        headers: {
                            Accept: "application/json",
                            "Content-Type": "application/json", // Change this to "application/json" instead of multipart/form-data
                            'Authorization': `Bearer ${await AsyncStorage.getItem('token')}`,
                        },
                    }
                );

                if (response.status === 200) {
                    Alert.alert("Thành công", `Nhật ký "${title}" đã được cập nhật!`);
                    navigation.navigate("viewdiary", { day: rawDate, temp1: Math.random() });
                    setTitle("");
                    setDescription("");
                    setSelectedImageInfo({ uri: null, name: null, type: null, base64: null });
                } else {
                    console.log("Lỗi server:", response.data);
                    throw new Error(response.data?.message || "Cập nhật nhật ký thất bại.");
                }
            } else {
                Alert.alert("Lỗi", "Không tìm thấy nhật ký cần sửa!");
            }
        } catch (error) {
            console.error("Lỗi khi gửi:", error);
            Alert.alert("Lỗi", `Không thể cập nhật, vui lòng thử lại!\n${error || ""}`);
        }
    }, [title, description, selectedImageInfo, rawDate, edit, navigation]);

    return (
        <View style={{ flex: 1 }}>
            <ScrollView style={{ flex: 1 }}>
                {/* Giao diện người dùng (không thay đổi) */}
                <Text style={{ textAlign: "center", paddingTop: 20, fontWeight: '400', fontSize: 30, fontFamily: "Playfair Display" }}>
                    {edit ? "Edit Diary" : "Write a Diary"}
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
                        style={{
                            minHeight: 102, // Đảm bảo có chiều cao tối thiểu
                            borderWidth: 1,
                            borderColor: "red",
                            borderRadius: 10,
                            paddingHorizontal: 10,
                            fontSize: 16,
                            textAlignVertical: "top", // Bắt đầu từ trên xuống
                            backgroundColor: "#fff",
                            // Không cần giới hạn chiều cao tối đa, nó sẽ tự động xuống dòng
                        }}
                        multiline // Cho phép nhiều dòng
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
                        onPress={edit ? handleEdit : handlePost}
                    >
                        <Text style={{ color: "white", fontWeight: "bold" }}>
                            {edit ? "Edit" : "Post"}
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Hiển thị ảnh đã chọn */}
                {selectedImageInfo.uri && (
                    <View style={{ alignItems: "center", marginTop: 10 }}>
                        <Image source={{ uri: selectedImageInfo.uri }} style={{ width: 100, height: 100, borderRadius: 10 }} />
                    </View>
                )}
            </ScrollView>
            <View style={styles.footer}>
                <Footer />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
    },
});