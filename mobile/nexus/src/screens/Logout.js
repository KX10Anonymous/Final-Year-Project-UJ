import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import React from 'react';

export default function Logout() {
    const navigation = useNavigation();

    React.useEffect(() => {
        const handleLogout = async () => {
            await AsyncStorage.clear();
                navigation.reset({
                    index: 0,
                    routes: [{ name: 'StartScreen' }],
                  });
        }
        const doLogout = async () => {
            try {
                await fetch("http://localhost:8080/nexus/api/auth/logout/" + user.jwt, {
                  method: "GET",
                  headers: {
                    "Content-Type": "application/json",
                  },
                });
                handleLogout();
              } catch (error) {
                handleLogout();
              }
        }
        doLogout();
      },[])
}