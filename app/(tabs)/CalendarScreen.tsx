import React, { useState, useCallback } from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity } from "react-native";
import { Calendar, DateData } from "react-native-calendars";
import { useNavigation, useRoute, useFocusEffect } from "@react-navigation/native";
import axios from "axios";
import { API_URL } from "../../constants/Gloubal";
import AsyncStorage from '@react-native-async-storage/async-storage';
import Footer from '@/components/Footer';

const CalendarScreen = () => {
  type RouteParams = {
    isview?: boolean;
  };

  const route = useRoute<{ params: RouteParams }>();
  const isview = route.params?.isview;
  const today = new Date().toISOString().split("T")[0];
  const navigation = useNavigation();
  const [markedDates, setMarkedDates] = useState<{ [key: string]: any }>({
    [today]: { selected: true, selectedColor: "#FF6B6B" },
  });

  const fetchDiaries = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      const res = await axios.get(`${API_URL}/api/diaries/all`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = res.data;

      const marks: { [key: string]: any } = {};
      data.forEach((item: any) => {
        const dateStr = item.date.split("T")[0];
        marks[dateStr] = {
          selected: true,
          selectedColor: "#FF6B6B",
          link_img: item.link_img,
        };
      });

      setMarkedDates((prev) => ({ ...prev, ...marks }));
    } catch (err) {
      console.error("Failed to fetch diaries:", err);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchDiaries();
    }, [])
  );

  const handleDayPress = (day: DateData) => {
    setMarkedDates({
      [day.dateString]: { selected: true, selectedColor: "#FF6B6B" },
    });

    if (isview) {
      navigation.navigate("viewdiary", { day: day.dateString });
    } else {
      navigation.navigate("postdiary", { day: day.dateString });
    }
  };

  return (
    <View style={styles.wrapper}>
      <View style={styles.container}>
        <Calendar
          current={today}
          markingType="custom"
          markedDates={markedDates}
          dayComponent={({ date, state }: { date?: DateData; state?: string }) => {
            if (!date) return null;
            const marked = markedDates[date.dateString];
            const hasImg = marked?.link_img;

            return (
              <TouchableOpacity onPress={() => handleDayPress(date)} style={styles.dayContainer}>
                {hasImg && (
                  <Image
                    source={{ uri: `data:image/jpeg;base64,${marked.link_img}` }}
                    style={styles.dayImage}
                  />
                )}
                <Text style={[styles.dayText, state === "disabled" && styles.disabledText]}>
                  {date.day}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      <Footer />
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    justifyContent: "space-between",
    backgroundColor: "#fff",
  },
  container: {
    marginTop: 20,
    paddingHorizontal: 10,
  },
  dayContainer: {
    alignItems: "center",
    justifyContent: "center",
    width: 48,
    height: 48,
    borderRadius: 8,
  },
  dayImage: {
    position: "absolute",
    width: 48,
    height: 48,
    resizeMode: "cover",
    borderRadius: 8,
  },
  dayText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#000",
  },
  disabledText: {
    color: "#d3d3d3",
  },
});

export default CalendarScreen;
