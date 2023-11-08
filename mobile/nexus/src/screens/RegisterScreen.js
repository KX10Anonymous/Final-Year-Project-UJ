import AsyncStorage from '@react-native-async-storage/async-storage'
import React, { useState } from 'react'
import { StyleSheet, TouchableOpacity, View } from 'react-native'
import { Text } from 'react-native-paper'
import BackButton from '../components/BackButton'
import Background from '../components/Background'
import Button from '../components/Button'
import Header from '../components/Header'
import Logo from '../components/Logo'
import TextInput from '../components/TextInput'
import { theme } from '../core/theme'
import { emailValidator } from '../helpers/emailValidator'
import { nameValidator } from '../helpers/nameValidator'
import { passwordValidator } from '../helpers/passwordValidator'
import { phoneValidator } from '../helpers/phoneValidator'

export default function RegisterScreen({ navigation }) {
  const [name, setName] = useState({ value: '', error: '' })
  const [surname, setSurname] = useState({ value: '', error: '' })
  const [phone, setPhone] = useState({value: '', error:''})
  const [email, setEmail] = useState({ value: '', error: '' })
  const [password, setPassword] = useState({ value: '', error: '' })

  const onSignUpPressed = () => {
    const nameError = nameValidator(name.value)
    const surnameError = nameValidator(surname.value)
    const emailError = emailValidator(email.value)
    const passwordError = passwordValidator(password.value)
    const phoneError = phoneValidator(phone.value)

    if (emailError || passwordError || nameError || surnameError || phoneError) {
      setName({ ...name, error: nameError })
      setEmail({ ...email, error: emailError })
      setPassword({ ...password, error: passwordError })
      setSurname({...surname, error: surnameError})
      setPhone({...phone, error: phoneError})
      return
    }
    doRegister()
  }

  const doRegister = async () => {
    console.log(name.value + phone.value + email.value)
      try {
        const reqBody = {
          firstname: name.value,
          lastname: surname.value,
          phone:phone.value,
          email: email.value,
          password: password.value,
        };
    
        const response = await fetch("http://10.0.2.2:8080/nexus/api/auth/register/MOBILE_APP", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(reqBody),
        });
    
        if (response.ok) {
          const data = await response.json();
    
          await AsyncStorage.setItem('jwt', data.jwt);
          await AsyncStorage.setItem('role', data.role);
          await AsyncStorage.setItem('refreshToken', data.refresh);
          await AsyncStorage.setItem('fullName', data.fullname);
    
          navigation.reset({
            index: 0,
            routes: [{ name: 'Dashboard' }],
          })
        } else {
         console.log("REGISTRATION FAILED")
        }
      } catch (error) {
        console.log(error);
      }
  };
  

  return (
    <Background>
      <BackButton goBack={navigation.goBack} />
      <Logo />
      <Header>Create Account</Header>
      <TextInput
        label="Name"
        returnKeyType="next"
        value={name.value}
        onChangeText={(text) => setName({ value: text, error: '' })}
        error={!!name.error}
        errorText={name.error}
      />
      <TextInput
        label="Surname"
        returnKeyType="next"
        value={surname.value}
        onChangeText={(text) => setSurname({ value: text, error: '' })}
        error={!!surname.error}
        errorText={surname.error}
      />
      <TextInput
        label="Email"
        returnKeyType="next"
        value={email.value}
        onChangeText={(text) => setEmail({ value: text, error: '' })}
        error={!!email.error}
        errorText={email.error}
        autoCapitalize="none"
        autoCompleteType="email"
        textContentType="emailAddress"
        keyboardType="email-address"
      />
      <TextInput
        label="Phone"
        returnKeyType="next"
        value={phone.value}
        onChangeText={(text) => setPhone({ value: text, error: '' })}
        error={!!phone.error}
        errorText={phone.error}
      />
      <TextInput
        label="Password"
        returnKeyType="done"
        value={password.value}
        onChangeText={(text) => setPassword({ value: text, error: '' })}
        error={!!password.error}
        errorText={password.error}
        secureTextEntry
      />
      <Button
        mode="contained"
        onPress={onSignUpPressed}
        style={{ marginTop: 24 }}
      >
        Sign Up
      </Button>
      <View style={styles.row}>
        <Text>Already have an account? </Text>
        <TouchableOpacity onPress={() => navigation.replace('LoginScreen')}>
          <Text style={styles.link}>Login</Text>
        </TouchableOpacity>
      </View>
    </Background>
  )
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    marginTop: 4,
  },
  link: {
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
})
