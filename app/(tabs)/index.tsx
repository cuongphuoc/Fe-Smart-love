import React, { useCallback, useState, useEffect } from 'react';
import { Image, StyleSheet, View, Text, FlatList, TouchableOpacity, ImageBackground } from 'react-native';
import { Svg, Path } from 'react-native-svg';
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import Footer from '@/components/Footer';
import { API_URL } from "../../constants/Gloubal";

// Define types for holiday objects
interface Holiday {
  id: string;
  name: string;
  month: number;
  day: number;
  icon: string;
}

// Define the holiday array with the Holiday type
const OUR_HOLIDAYS: Holiday[] = [
  { id: 'h1', name: 'Reunification Day', month: 4, day: 30, icon: '🇻🇳' },
  { id: 'h2', name: 'Intl. Workers\' Day', month: 5, day: 1, icon: '🛠️' },
  { id: 'h3', name: 'National Day', month: 9, day: 2, icon: '🎉' },
  { id: 'h4', name: 'Christmas Day', month: 12, day: 25, icon: '🎄' },
  { id: 'h5', name: 'New Year\'s Day', month: 1, day: 1, icon: '🎆' },
  { id: 'h6', name: 'Valentine\'s Day', month: 2, day: 14, icon: '💕' },
  // Add more holidays as needed. Dates are Gregorian.
  // For holidays based on the Lunar calendar (like Tết), a more complex calculation or an API would be needed.
];

// Define the type for the API response
interface HomeApiResponse {
  totalDiaries: number;
  diariesToday: number;
  datingDays: number;
}

// Define the type for the upcoming holiday state
interface UpcomingHoliday extends Holiday {
  date: Date;
  daysUntil: number;
}

export default function HomeScreen() {
  const navigation = useNavigation();
  const [daysTogether, setDaysTogether] = useState<number>(0);
  const [totalDiaries, setTotalDiaries] = useState<number>(0);
  const [diariesToday, setDiariesToday] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [upcomingHolidays, setUpcomingHolidays] = useState<UpcomingHoliday[]>([]);

  const fetchDiaryStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    const token = await AsyncStorage.getItem('token');
    if (!token) {
      console.log("No token found, navigating to login");
      navigation.navigate('login');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/home`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          console.log("Authentication error, navigating to login");
          navigation.navigate('login');
        } else {
          const message = `An error occurred: ${response.status}`;
          throw new Error(message);
        }
      } else {
        const data: HomeApiResponse = await response.json();
        console.log("data", data);
        setTotalDiaries(data.totalDiaries);
        setDiariesToday(data.diariesToday);
        setDaysTogether(data.datingDays);
      }
    } catch (error: any) {
      setError(error.message);
      console.error("Error fetching diary stats:", error);
    } finally {
      setLoading(false);
    }
  }, [navigation]);

  useEffect(() => {
    fetchDiaryStats();
  }, [fetchDiaryStats]);

  useFocusEffect(
    useCallback(() => {
      fetchDiaryStats();
    }, [fetchDiaryStats])
  );

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

  const calculateUpcomingHolidays = useCallback(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize to start of day for comparison

    const processedHolidays = OUR_HOLIDAYS.map((holiday) => {
      let holidayDateThisYear = new Date(today.getFullYear(), holiday.month - 1, holiday.day);
      holidayDateThisYear.setHours(0, 0, 0, 0);

      let holidayDateToConsider: Date;
      if (holidayDateThisYear < today) {
        // Holiday has passed this year, consider next year's occurrence
        holidayDateToConsider = new Date(today.getFullYear() + 1, holiday.month - 1, holiday.day);
      } else {
        // Holiday is today or in the future this year
        holidayDateToConsider = holidayDateThisYear;
      }
      holidayDateToConsider.setHours(0,0,0,0); // Ensure time is zeroed out

      const diffTime = holidayDateToConsider.getTime() - today.getTime();
      // Calculate days until, ensuring it's at least 0 (for D-0 if it's today)
      const diffDays = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

      return {
        ...holiday,
        date: holidayDateToConsider, // The actual upcoming date object
        daysUntil: diffDays,
      };
    });

    // Sort holidays by their upcoming date
    processedHolidays.sort((a, b) => {
      if (a.date.getTime() === b.date.getTime()) {
        return a.id.localeCompare(b.id); // Stable sort if dates are identical
      }
      return a.date.getTime() - b.date.getTime();
    });

    setUpcomingHolidays(processedHolidays.slice(0, 2)); // Get the two nearest
  }, []); // Empty dependency array as OUR_HOLIDAYS is stable

  useEffect(() => {
    calculateUpcomingHolidays(); // Calculate on initial mount
  }, [calculateUpcomingHolidays]);

  useFocusEffect(
    useCallback(() => {
      calculateUpcomingHolidays(); // Recalculate when screen comes into focus (e.g., date might have changed)
    }, [calculateUpcomingHolidays])
  );

  if (loading) {
    return <Text>Loading stats...</Text>;
  }

  if (error) {
    return <Text>Error loading stats: {error}</Text>;
  }

  return (
    <View style={styles.container}>
      {/* Hình ảnh nền */}
      <View style={styles.imageWrapper}>
        <Image
          source={require('@/assets/images/my-image.png')}
          style={styles.headerImage}
        />
      </View>


      {/* Day Counter Section */}
      <View style={styles.dayCounterContainer}>
        <Text style={styles.dayCounterTitle}>Days Together</Text>
        <View style={styles.dayCounterBox}>
          <Svg width={40} height={40} viewBox="0 0 24 24">
            <Path
              d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
              fill="#ff69b4"
            />
          </Svg>
          <Text style={styles.dayCounterText}>{daysTogether} days</Text>
        </View>
      </View>

      {/* Total Heart, Today Heart */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 20, marginTop: 20, paddingHorizontal: 20 }}>
        <View style={styles.statBoxPink}>
          <Text style={styles.statBoxTitle}>Total diaries</Text>
          <View style={styles.statBoxContent}>
            <Svg width={80} height={80} viewBox="0 0 24 24">
              <Path
                d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
                fill="#FFF"
              />
            </Svg>
            <Text style={[styles.statBoxNumber, { color: '#FFE6E0' }]}>{totalDiaries}</Text>
          </View>
          <TouchableOpacity
            style={styles.statBoxButton}
            onPress={() => navigation.navigate("CalendarScreen", { isview: true })}>
            <Text style={styles.statBoxButtonText}>View calendar ►</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.statBoxGray}>
          <Text style={styles.statBoxTitle}>Today heart</Text>
          <View style={styles.statBoxContent}>
            <Svg width={80} height={80} viewBox="0 0 24 24">
              <Path
                d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
                fill="#FFE6E0"
              />
            </Svg>
            <Text style={[styles.statBoxNumber, { color: '#333131E0' }]}>{diariesToday}</Text>
          </View>
          <TouchableOpacity
            style={styles.statBoxButton}
            onPress={() => navigation.navigate("postdiary")}>
            <Text style={styles.statBoxButtonText}>Write diary ►</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Upcoming Holidays Section */}
      <View style={styles.upcomingHolidaysContainer}>
        <Text style={styles.upcomingHolidaysTitle}>Upcoming Holidays ►</Text>
        {upcomingHolidays.length > 0 ? (
          <View style={styles.holidaysRow}>
            {upcomingHolidays.map((holiday) => (
              <View key={holiday.id} style={styles.holidayBox}>
                <Text style={styles.holidayIcon}>{holiday.icon}</Text>
                <Text style={styles.holidayName} numberOfLines={2}>{holiday.name}</Text>
                <Text style={styles.holidayDateText}>
                  {holiday.date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                </Text>
                <View style={styles.countdownBadge}>
                  <Text style={styles.holidayCountdownText}>D-{holiday.daysUntil}</Text>
                </View>
              </View>
            ))}
          </View>
        ) : (
          <Text style={styles.noHolidaysText}>No upcoming holidays to show.</Text>
        )}
      </View>

      <Footer />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  imageWrapper: {
    width: "100%",
    height: 169,
  },
  headerImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  eventItem: {
    paddingVertical: 2,
    borderBottomWidth: 0.5,
    borderBottomColor: '#ccc',
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderStyle: 'dashed',
    paddingHorizontal: 20,
  },
  eventText: {
    fontSize: 10,
  },
  daysText: {
    color: '#999',
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
    alignSelf: 'stretch',
    justifyContent: 'center',
  },
  dayCounterText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ff69b4',
    marginLeft: 10,
  },
  // Styles for Stat Boxes (Total/Today Diaries)
  statBoxPink: {
    flex: 1, // Takes half the space
    height: 181,
    backgroundColor: '#FFE4DD',
    borderRadius: 20,
    padding: 15,
    alignItems: 'center',
    // marginRight: 10, // gap property handles spacing
  },
  statBoxGray: {
    flex: 1, // Takes half the space
    height: 181,
    backgroundColor: '#A9A9A9', // Changed to a lighter gray for better text contrast if needed
    borderRadius: 20,
    padding: 15,
    alignItems: 'center',
    // marginLeft: 10, // gap property handles spacing
  },
  statBoxTitle: {
    color: '#fff',
    fontSize: 12,
    marginBottom: 10,
    alignSelf: 'flex-start',
  },
  statBoxContent: {
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1, // Allow content to take available space
  },
  statBoxNumber: {
    fontSize: 12, // Matched original, consider increasing for visibility
    fontWeight: 'bold', // Made bold for visibility
    position: 'absolute',
  },
  statBoxButton: {
    width: '100%',
    alignItems: 'flex-end',
    position: 'absolute',
    bottom: 10,
    right: 10,
  },
  statBoxButtonText: {
    color: '#FFF',
    fontSize: 12,
    // marginTop: 15, // Removed, position absolute handles it
  },
  // Styles for Upcoming Holidays Section
  upcomingHolidaysContainer: {
    width: '100%',
    paddingHorizontal: 20,
    marginTop: 20,
    marginBottom: 20, // Add some space before footer
  },
  upcomingHolidaysTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  holidaysRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 15, // Defines space between holiday boxes
  },
  holidayBox: {
    flex: 1, // Each box will take equal width
    backgroundColor: '#E8F5E9', // Light green background
    borderRadius: 15,
    padding: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
    minHeight: 130, // Ensure boxes have a minimum height
    justifyContent: 'space-around', // Distribute space within the box
  },
  holidayIcon: {
    fontSize: 28,
    marginBottom: 8,
    color: '#388E3C', // Darker green for icon
  },
  holidayName: {
    fontSize: 13, // Slightly smaller to fit potentially longer names
    fontWeight: '600', // Semi-bold
    color: '#2E7D32', // Dark green for text
    textAlign: 'center',
    marginBottom: 5,
  },
  holidayDateText: {
    fontSize: 11,
    color: '#1B5E20', // Even darker green
    marginBottom: 8,
  },
  countdownBadge: {
    backgroundColor: '#FF69B4', // Using the app's theme pink
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  holidayCountdownText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  noHolidaysText: {
    textAlign: 'center',
    color: '#777',
    marginTop: 10,
    fontStyle: 'italic',
  }
});