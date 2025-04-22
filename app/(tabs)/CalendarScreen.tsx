import React, { useState } from "react";
import { View, Text, Image, StyleSheet, Alert, TouchableOpacity } from "react-native";
import { Calendar, DateData } from "react-native-calendars";
import { useNavigation } from "@react-navigation/native";
import { useRoute } from "@react-navigation/native";
const CalendarScreen = () => {
  type RouteParams = {
    isview?:boolean;
  };
  
  const route = useRoute<{ params: RouteParams }>();
  const isview= route.params?.isview;
  console.log("isview "+isview)
  const today = new Date().toISOString().split("T")[0];
  const navigation = useNavigation();
  const [markedDates, setMarkedDates] = useState({
    [today]: { selected: true, selectedColor: "#FF6B6B" },
  });

  const handleDayPress = (day: DateData) => {
    console.log("Ngày được chọn:", day.dateString);
    Alert.alert("Bạn đã chọn", day.dateString);
    
    setMarkedDates({
      [day.dateString]: { selected: true, selectedColor: "#FF6B6B" },
    });
    if(isview){
      navigation.navigate("viewdiary",{day:day.dateString});
    }else
    navigation.navigate("postdiary",{day:day.dateString});
  };

  return (
    <Calendar
      current={today}
      markingType="custom"
      markedDates={markedDates}
      dayComponent={({ date, state }: { date?: DateData; state?: string }) => {
        if (!date) return null;
        const isMarked = markedDates[date.dateString];

        return (
          <TouchableOpacity onPress={() => handleDayPress(date)} style={styles.dayContainer}>
            {isMarked && (
              <Image
                source={require("../../assets/images/phai.png")}
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
  );
};

const styles = StyleSheet.create({
  dayContainer: {
    alignItems: "center",
    justifyContent: "center",
    width: 32,
    height: 32,
  },
  dayImage: {
    position: "absolute",
    width: 32,
    height: 32,
    resizeMode: "contain",
  },
  dayText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
  },
  disabledText: {
    color: "#d3d3d3",
  },
});

export default CalendarScreen;
