import { View, Text, Image, TouchableOpacity, Button,TextInput, } from 'react-native';
import DatePicker from 'react-native-date-picker';
import { AntDesign } from '@expo/vector-icons';
import { useState } from 'react';
import { FontAwesome } from "@expo/vector-icons"; 
export default function ProfileScreen() {
    const [text, setText] = useState("");
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const today = new Date();
    const formattedDate = today.toLocaleDateString("en-GB", {
        weekday: "short",
        day: "numeric",
        month: "long",
        year: "numeric",
    });
    return (
        <View >
            <Text style={{ textAlign: "center", paddingTop: 20, fontWeight: 400, fontSize: 30, fontFamily: "Playfair Display" }}>Write a Diary</Text>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
  <Image 
    source={require('@/assets/images/phai.png')} 
    style={{ width: 40, height: 40, borderRadius: 20, marginLeft: 30 }} 
  />
  <View style={{ flexDirection: "row", alignItems: "center" }}>
    <Text style={{ fontSize: 13,fontFamily:"Playfair Display",lineHeight:100, fontWeight: 500, textAlign:"center",marginLeft:90,marginRight:10 }}>
      {formattedDate}
    </Text>
    <Text style={{ color: "#F88585" }}>▼</Text>
  </View>
</View>
<View style={{ padding: 20 }}>
      <TextInput
        placeholder="Title"
        placeholderTextColor="#000"
        
        
        style={{
          height: 70,
          borderWidth: 1,
          borderColor: "red",
          borderRadius: 10,
          paddingHorizontal: 10,
          paddingBottom: 40, // Đẩy chữ placeholder lên trên
          fontSize: 16,
          textAlignVertical: "top", // Căn chữ lên trên
          backgroundColor: "#fff",
        }}
        value={title}
        onChangeText={setTitle}
      />
    </View>
    <View style={{ paddingHorizontal: 20 }}>
      <TextInput
        placeholder="Description"
        placeholderTextColor="#000"
        style={{
          height: 102,
          borderWidth: 1,
          borderColor: "red",
          borderRadius: 10,
          paddingHorizontal: 10,
          paddingBottom: 40, // Đẩy chữ placeholder lên trên
          fontSize: 16,
          textAlignVertical: "top", // Căn chữ lên trên
          backgroundColor: "#fff",
        }}
        value={description} // Dùng state riêng cho Description
        onChangeText={setDescription}
      />
      
    </View>

 {/* Thanh công cụ */}
 <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          marginTop: 10,
        }}
      >
        {/* Các icon */}
        <View style={{ flexDirection: "row", gap: 15 ,paddingHorizontal:20}}>
          <FontAwesome name="image" size={24} color="#EE1D52B0" />
          <FontAwesome name="camera" size={24} color="#EE1D52B0" />
          <FontAwesome name="smile-o" size={24} color="#EE1D52B0" />
          <FontAwesome name="map-marker" size={24} color="#EE1D52B0" />
        </View>

        {/* Nút Post */}
        <TouchableOpacity
          style={{
            backgroundColor: "#EE1D52B0",
            paddingVertical: 8,
            paddingHorizontal: 20,
            borderRadius: 20,
            marginRight:10
          }}
        >
          <Text style={{ color: "white", fontWeight: "bold" }}>Post</Text>
        </TouchableOpacity>
      </View>
        </View>

    );
}