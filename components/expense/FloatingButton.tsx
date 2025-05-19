import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface FloatingButtonProps {
  onPress?: () => void;
}

const FloatingButton: React.FC<FloatingButtonProps> = ({ onPress }) => {
  return (
    <TouchableOpacity style={styles.fab} onPress={onPress}>
      <Ionicons name="add" size={42} color="white" />
    </TouchableOpacity>
  );
};

export default FloatingButton;

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    bottom: 100,
    right: 20,
    backgroundColor: '#EE1D52',
    width: 70,
    height: 70,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
  },
});
