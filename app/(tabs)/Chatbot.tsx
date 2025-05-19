import React, { useState, useEffect } from 'react';
import {
  View,
  TextInput,
  Button,
  FlatList,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../../constants/Gloubal';
import Footer from '@/components/Footer';

const ChatBotScreen = () => {
  const [messages, setMessages] = useState([
    {
      id: '1',
      from: 'bot',
      text: 'Chào bạn! Mình là Insghta 💖 Có chuyện gì cần tâm sự không?',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState('');

  useEffect(() => {
    const fetchToken = async () => {
      const storedToken = await AsyncStorage.getItem('token');
      if (storedToken) {
        setToken(storedToken);
      }
    };
    fetchToken();
  }, []);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = {
      id: Date.now().toString(),
      from: 'user',
      text: input,
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await axios.post(
        `${API_URL}/api/chat`,
        { prompt: input },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const botReply = response.data.response;
      const botMessage = {
        id: Date.now().toString() + '-bot',
        from: 'bot',
        text: botReply,
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (err) {
      console.error('Chat error:', err.message);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString() + '-err',
          from: 'bot',
          text: 'Lan gặp chút trục trặc khi trả lời 😢. Bạn thử lại nhé!',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }) => (
    <View
      style={[
        styles.message,
        item.from === 'user' ? styles.user : styles.bot,
      ]}
    >
      {item.from === 'bot' && <Text style={styles.botIcon}>🤖</Text>}
      <Text style={styles.text}>{item.text}</Text>
    </View>
  );

  return (
    <View style={styles.wrapper}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
      >
        <FlatList
          data={messages}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 10 }}
        />
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Nhập tin nhắn..."
            value={input}
            onChangeText={setInput}
            editable={!loading}
          />
          <Button title="Gửi" onPress={sendMessage} disabled={loading} />
        </View>
      </KeyboardAvoidingView>
      <Footer />
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    justifyContent: 'space-between',
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
    marginTop:50,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 10,
    borderTopWidth: 1,
    borderColor: '#ccc',
    backgroundColor: '#fff',
    marginBottom: 50, // Nâng input lên một chút để tránh bị che bởi footer
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    paddingHorizontal: 10,
    marginRight: 10,
  },
  message: {
    maxWidth: '80%',
    padding: 10,
    borderRadius: 10,
    marginVertical: 4,
    flexDirection: 'row',
    alignItems: 'flex-start', // Căn chỉnh icon và text theo chiều ngang
  },
  user: {
    alignSelf: 'flex-end',
    backgroundColor: '#DCF8C6',
  },
  bot: {
    alignSelf: 'flex-start',
    backgroundColor: '#F1F0F0',
  },
  text: {
    fontSize: 16,
    paddingBottom: 2, // Thêm padding dưới text
    flexShrink: 1, // Cho phép text thu nhỏ nếu cần
  },
  botIcon: {
    marginRight: 5,
    fontSize: 18,
  },
});

export default ChatBotScreen;