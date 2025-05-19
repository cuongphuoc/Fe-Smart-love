import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import ExpenseScreen from '@/app/(tabs)/ExpenseScreen';
import AddExpense from '@/app/(tabs)/AddExpense';
import ExpenseTransaction from '@/app/(tabs)/ExpenseTransaction';

export type ExpenseStackParamList = {
    ExpenseScreen: undefined;
    AddExpense: undefined;
    ExpenseTransaction: undefined;
  };
  
const Stack = createStackNavigator<ExpenseStackParamList>();
const ExpenseStack = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="ExpenseScreen">
        <Stack.Screen name="ExpenseScreen" component={ExpenseScreen} />
        <Stack.Screen name="ExpenseTransaction" component={ExpenseTransaction} />
        <Stack.Screen name="AddExpense" component={AddExpense} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default ExpenseStack;
