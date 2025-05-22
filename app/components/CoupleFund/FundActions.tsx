import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import coupleFundService from '../../api/coupleFundService';

interface FundActionsProps {
  onSuccess?: () => void; // Callback khi thao tác thành công
}

const FundActions: React.FC<FundActionsProps> = ({ onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [logMessages, setLogMessages] = useState<string[]>([]);
  const [fundId, setFundId] = useState<string>('');

  // Hàm ghi log
  const addLog = (message: string) => {
    setLogMessages(prev => [...prev, `${new Date().toISOString().slice(11, 19)}: ${message}`]);
  };

  // Lấy dữ liệu fund
  const getFundData = async () => {
    setLoading(true);
    addLog("Đang lấy dữ liệu fund...");
    
    try {
      const fund = await coupleFundService.getFund();
      if (fund._id) {
        setFundId(fund._id);
      }
      addLog(`Lấy dữ liệu thành công: ${fund.name}, balance: ${fund.balance}, id: ${fund._id || 'không có ID'}`);
      if (onSuccess) onSuccess();
    } catch (error: any) {
      addLog(`Lỗi khi lấy dữ liệu: ${error.message}`);
      Alert.alert('Lỗi', 'Không thể lấy dữ liệu quỹ: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Tạo giao dịch mới
  const createTransaction = async () => {
    setLoading(true);
    addLog("Đang tạo giao dịch mới...");
    
    try {
      const transaction = {
        amount: 100000,
        type: 'deposit' as const,
        category: 'Tiền mừng',
        description: 'Test giao dịch ' + new Date().toLocaleDateString(),
        createdBy: 'Nguyễn Văn A'
      };
      
      addLog(`Dữ liệu giao dịch: ${JSON.stringify(transaction)}`);
      const response = await coupleFundService.addTransaction(transaction);
      addLog(`Tạo giao dịch thành công! Balance mới: ${response.balance}`);
      Alert.alert('Thành công', 'Đã thêm giao dịch mới!');
      if (onSuccess) onSuccess();
    } catch (error: any) {
      addLog(`Lỗi khi tạo giao dịch: ${error.message}`);
      Alert.alert('Lỗi', 'Không thể tạo giao dịch: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Cập nhật thông tin fund
  const updateFundInfo = async () => {
    setLoading(true);
    addLog("Đang cập nhật thông tin fund...");
    
    try {
      if (!fundId) {
        addLog("Lỗi: Chưa có fundId. Vui lòng lấy dữ liệu fund trước.");
        Alert.alert('Lỗi', 'Vui lòng lấy dữ liệu fund trước khi cập nhật');
        setLoading(false);
        return;
      }

      const updatedData = {
        name: 'Quỹ đã cập nhật ' + new Date().toLocaleDateString(),
        goal: {
          name: 'Mục tiêu mới',
          amount: 15000000,
          completed: false
        }
      };
      
      addLog(`Dữ liệu cập nhật: ${JSON.stringify(updatedData)}`);
      const response = await coupleFundService.updateFund(fundId, updatedData);
      addLog(`Cập nhật thành công! Tên mới: ${response.name}`);
      Alert.alert('Thành công', 'Đã cập nhật thông tin quỹ!');
      if (onSuccess) onSuccess();
    } catch (error: any) {
      addLog(`Lỗi khi cập nhật: ${error.message}`);
      Alert.alert('Lỗi', 'Không thể cập nhật thông tin: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Thêm đối tác mới
  const addNewPartner = async () => {
    setLoading(true);
    addLog("Đang thêm đối tác mới...");
    
    try {
      const partner = {
        name: 'Đối tác mới ' + new Date().toLocaleTimeString(),
        email: `partner_${Date.now()}@example.com`
      };
      
      addLog(`Dữ liệu đối tác: ${JSON.stringify(partner)}`);
      const response = await coupleFundService.addPartner(partner);
      addLog(`Thêm đối tác thành công! Số đối tác: ${response.partners.length}`);
      Alert.alert('Thành công', 'Đã thêm đối tác mới!');
      if (onSuccess) onSuccess();
    } catch (error: any) {
      addLog(`Lỗi khi thêm đối tác: ${error.message}`);
      Alert.alert('Lỗi', 'Không thể thêm đối tác: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Thao tác Couple Fund</Text>
      
      <View style={styles.actionContainer}>
        <TouchableOpacity 
          style={[styles.button, loading && styles.disabledButton]} 
          onPress={getFundData}
          disabled={loading}
        >
          <Text style={styles.buttonText}>Lấy dữ liệu</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.button, loading && styles.disabledButton]} 
          onPress={createTransaction}
          disabled={loading}
        >
          <Text style={styles.buttonText}>Tạo giao dịch</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.button, loading && styles.disabledButton]} 
          onPress={updateFundInfo}
          disabled={loading}
        >
          <Text style={styles.buttonText}>Cập nhật quỹ</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.button, loading && styles.disabledButton]} 
          onPress={addNewPartner}
          disabled={loading}
        >
          <Text style={styles.buttonText}>Thêm đối tác</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.logContainer}>
        <Text style={styles.logTitle}>Log:</Text>
        <View style={styles.logBox}>
          {logMessages.map((log, index) => (
            <Text key={index} style={styles.logText}>{log}</Text>
          ))}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    marginVertical: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#343a40',
  },
  actionContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  button: {
    backgroundColor: '#5c6bc0',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 4,
    marginBottom: 8,
    minWidth: '48%',
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: '500',
  },
  disabledButton: {
    backgroundColor: '#aab6fe',
  },
  logContainer: {
    marginTop: 16,
  },
  logTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#495057',
  },
  logBox: {
    backgroundColor: '#232323',
    borderRadius: 4,
    padding: 12,
    maxHeight: 200,
  },
  logText: {
    color: '#64dd17',
    fontFamily: 'monospace',
    fontSize: 12,
    marginBottom: 4,
  },
});

export default FundActions; 