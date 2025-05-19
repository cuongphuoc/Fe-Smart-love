import React, { useCallback, useState, useEffect } from 'react';
import { Image, StyleSheet, View, Text, FlatList, TouchableOpacity, ImageBackground } from 'react-native';
import { Svg, Path } from 'react-native-svg';
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import Footer from '@/components/Footer';

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
    const navigation = useNavigation();
    const [daysTogether, setDaysTogether] = useState(0);

    // Replace with your relationship start date (e.g., '2023-01-01')
    const relationshipStartDate = new Date('2023-01-01');

    // Function to calculate days between start date and today
    const calculateDaysTogether = () => {
        const today = new Date();
        const timeDiff = today - relationshipStartDate;
        const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
        setDaysTogether(days);
    };

    useEffect(() => {
        calculateDaysTogether();
        // Optional: Update daily
        const interval = setInterval(calculateDaysTogether, 1000 * 60 * 60 * 24);
        return () => clearInterval(interval);
    }, []);

    const checkToken = useCallback(async () => {
        const token = await AsyncStorage.getItem('token');
        if (!token) {
            console.log("No token found, navigating to login");
            navigation.navigate('login');
        }
    }, [navigation]);

    useFocusEffect(
        useCallback(() => {
            checkToken();
        }, [checkToken])
    );

    return (
        <View style={styles.container}>
            {/* Hình ảnh nền */}
            <View style={styles.imageWrapper}>
                <Image
                    source={require('@/assets/images/my-image.png')}
                    style={styles.headerImage}
                />
                
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

            {/* Day Counter Section */}
            <View style={styles.dayCounterContainer}>
                <Text style={styles.dayCounterTitle}>Days Together</Text>
                <View style={styles.dayCounterBox}>
                    <Svg width="40" height="40" viewBox="0 0 24 24">
                        <Path
                            d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
                            fill="#ff69b4"
                        />
                    </Svg>
                    <Text style={styles.dayCounterText}>{daysTogether} days</Text>
                </View>
            </View>

            {/* Remaining sections (Total Heart, Today Heart, Collection, Footer) */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 20, marginTop: 20 }}>
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
                        alignSelf: 'flex-start'
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
                        <TouchableOpacity onPress={() => {
                            console.log("Button Pressed");
                            navigation.navigate("CalendarScreen", { isview: true });
                        }}>
                            <Text style={{ color: '#FFF', fontSize: 12, marginTop: 15 }}>View calendar ►</Text>
                        </TouchableOpacity>
                    </View>
                </View>

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
                        alignSelf: 'flex-start'
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
                        <TouchableOpacity onPress={() => navigation.navigate("postdiary")}>
                            <Text style={{ color: '#FFF', fontSize: 12, marginTop: 15 }}>Write diary ►</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>

            <View style={{ padding: 10, backgroundColor: "#fff" }}>
                <Text style={{ fontSize: 9, fontWeight: "400", color: "#888", marginBottom: 10, marginLeft: 20 }}>Collection ►</Text>
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
            <Footer />
        </View>
    );
}

const styles = StyleSheet.create({
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
    dayCounterContainer: {
        width: '100%',
        alignItems: 'center',
        marginTop: 10,
        paddingHorizontal: 20,
    },
    dayCounterTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 10,
    },
    dayCounterBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFE4DD',
        borderRadius: 10,
        padding: 15,
    },
    dayCounterText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#ff69b4',
        marginLeft: 10,
    },
});