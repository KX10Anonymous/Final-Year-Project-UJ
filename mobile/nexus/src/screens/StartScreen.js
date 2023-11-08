import AsyncStorage from '@react-native-async-storage/async-storage'
import React from 'react'
import Background from '../components/Background'
import Button from '../components/Button'
import Header from '../components/Header'
import Logo from '../components/Logo'
import Paragraph from '../components/Paragraph'


export default function StartScreen({ navigation }) {

  React.useEffect(() => {
    const checkSession = async () => {
      const jwt = await AsyncStorage.getItem('jwt');
      if(jwt){
        navigation.reset({
          index: 0,
          routes: [{ name: 'Dashboard' }],
        });
      }
    }
    checkSession();
  })

  return (
    <Background>
      <Logo />
      <Paragraph>
      "Effortless Hospitality, Seamless Management..."
      </Paragraph>
      <Button
        mode="contained"
        onPress={() => navigation.navigate('LoginScreen')}
      >
        Login
      </Button>
      <Button
        mode="outlined"
        onPress={() => navigation.navigate('RegisterScreen')}
      >
        Sign Up
      </Button>
    </Background>
  )
}
