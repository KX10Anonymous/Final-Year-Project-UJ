import { NavigationContainer } from '@react-navigation/native'
import { createStackNavigator } from '@react-navigation/stack'
import React from 'react'
import { Provider } from 'react-native-paper'
import { theme } from './src/core/theme'
import {
  Bookings,
  Dashboard,
  Invoices,
  LoginScreen,
  Notifications,
  RegisterScreen,
  ResetPasswordScreen,
  Rooms,
  StartScreen
} from './src/screens'

const Stack = createStackNavigator()

export default function App() {
  return (
    <Provider theme={theme}>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="StartScreen"
          screenOptions={{
            headerShown: false,
          }}
        >
          <Stack.Screen name="StartScreen" component={StartScreen} />
          <Stack.Screen name="Bookings" component={Bookings} />
          <Stack.Screen name="Invoices" component={Invoices} />
          <Stack.Screen name="Notifications" component={Notifications} />
          <Stack.Screen name="Rooms" component={Rooms} />
          <Stack.Screen name="LoginScreen" component={LoginScreen} />
          <Stack.Screen name="RegisterScreen" component={RegisterScreen} />
          <Stack.Screen name="Dashboard" component={Dashboard} />
          <Stack.Screen
            name="ResetPasswordScreen"
            component={ResetPasswordScreen}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </Provider>
  )
}
