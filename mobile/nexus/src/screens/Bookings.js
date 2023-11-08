import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { FlatList, Text, View } from 'react-native';
import { Button, Card, Chip, Provider } from 'react-native-paper';
import Background from '../components/Background';
import dayjs from 'dayjs';


const theme = {
  primaryColor: '#FFF',
  secondaryColor: '#FFF',
  backgroundColor: '#FFF',
  textColor: '#333',
};

const Bookings = ({ activeTab }) => {
  const [bookings, setBookings] = useState([]);
  const [token, setToken] = useState('');
  let read = true;
  useEffect(() => {
    const fetchBookings = async () => {
      if (token) {
        axios
          .get('http://10.0.2.2:8080/nexus/api/bookings/bookings/' + token)
          .then(response => {
            setBookings(response.data);
          });
      } else {
        const jwt = await AsyncStorage.getItem('jwt');
        setToken(jwt);
      }
    };
  
    if (activeTab === "Bookings") {
      fetchBookings();
    }
  }, [read, token, activeTab]);


  const deleteBooking = async (bookingId) => {
    const reqBody = {
      id: bookingId,
    };
    await fetch(
      "http://10.0.2.2:8080/nexus/api/bookings/delete/" + token,
      {
        headers: {
          "Content-Type": "application/json",
        },
        method: "delete",
        body: JSON.stringify(reqBody),
      }
    )
      .then((response) => {
        if (response.status === 200) {
          response.json().then((data) => {
            if (data === false) {
              setBookings((prevBookings) =>
                prevBookings.filter((booking) => booking.id !== bookingId)
              );
            }
          });
        } else if (response.status === 401) {
          console.log("No Authority");
        }
      })
      .catch((message) => {
        console.log("Error Occurred When Deleting Booking");
      });

  };

  return bookings.length > 0 && (
    <Background>
      <View>
        <FlatList
          style={{ width: '100%' }}
          data={bookings}
          keyExtractor={item => item.id.toString()}
          renderItem={({ item }) => (
            <>
              <Provider theme={theme}>
                <Card style={{ width: '100%' }}>
                  <Card.Content>
                    <Chip mode="outlined" icon="calendar-multiselect">
                      Check In Date: {dayjs(item.checkin).format('DD-MM-YYYY').toString()}
                    </Chip>
                    <Chip mode="outlined" icon="calendar-multiselect">
                      Check Out Date: {dayjs(item.checkout).format('DD-MM-YYYY').toString()}
                    </Chip>
                    <Text></Text>
                    <Chip mode="outlined" icon="home-heart">
                      Room Type: {item.type}
                    </Chip>
                    <Chip mode="outlined" icon="face-man">
                      Guest: {item.guest}
                    </Chip>
                  </Card.Content>
                  <Card.Actions>
                    <Button onPress={() => deleteBooking(item.id)}>Delete</Button>
                  </Card.Actions>
                </Card>
              </Provider>
              <Text> </Text>
            </>
          )}
        />
      </View>
    </Background>
  )
};

export default Bookings;
