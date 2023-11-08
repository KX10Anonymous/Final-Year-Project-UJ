import AsyncStorage from '@react-native-async-storage/async-storage';
import DatePicker from '@react-native-community/datetimepicker';
import axios from 'axios';
import dayjs from 'dayjs';
import React, { useEffect, useState } from 'react';
import {
  FlatList,
  Platform,
  Pressable,
  SafeAreaView,
  Text,
  TextInput,
  View,
  ScrollView
} from 'react-native';
import { Button, Card, Chip, Dialog, Portal, Switch, Snackbar, ActivityIndicator, MD2Colors } from 'react-native-paper';
import Background from '../components/Background';
import { SelectList } from 'react-native-dropdown-select-list'

let isSearching = false;
let checkin = dayjs();
let checkout = dayjs();
let searchAmenities = [];
let type = '';

const Search = ({ updateIsSearching }) => {
  const [checkInDate, setCheckInDate] = React.useState(dayjs());
  const [checkOutDate, setCheckOutDate] = React.useState(dayjs());
  const [roomType, setRoomType] = React.useState('');
  const [amenities, setAmenities] = React.useState([]);
  const [isCheckinDate, setIsCheckinDate] = useState(false);
  const [isCheckoutDate, setIsCheckoutDate] = useState(false);
  const currDate = dayjs();

  const options = [
    'Wi-Fi',
    'Coffee Station',
    'Television',
    'Valet Parking',
    'Swimming Pool',
    'Jacuzzi',
    'Room Service',
  ];

  const roomTypes = [
    { key: '1', value: 'Junior Suite' },
    { key: '2', value: 'Standard Double Bed' },
    { key: '3', value: 'Executive Suite' },
    { key: '4', value: 'Presidential Suite' },
    { key: '5', value: 'Apartment' },
    { key: '6', value: 'Royal Suite' },
  ]

  const handleAmenityClick = (amenity) => {
    const currAmenities = [...amenities];
    const i = currAmenities.indexOf(amenity);
    if (i === -1) {
      currAmenities.push(amenity);
    } else {
      currAmenities.splice(i, 1);
    }
    setAmenities(currAmenities);
    console.log(currAmenities);
  };

  const sendSearch = async () => {
    try {
      searchAmenities = amenities;
      checkin = dayjs(checkInDate);
      checkout = dayjs(checkOutDate);
      type = roomType;
      isSearching = !isSearching;
      updateIsSearching();
    } catch (error) {
      console.log('Error Occurred' + error);
    }
  };

  const onCheckinChange = ({ type }, selectedDate) => {
    if (type === 'set') {
      setCheckInDate(dayjs(selectedDate));
      if (Platform.OS === 'android') {
        toggleCheckin();
      }
    } else {
      toggleCheckin();
    }
  };

  const onCheckoutChange = ({ type }, selectedDate) => {
    if (type === 'set') {
      setCheckOutDate(dayjs(selectedDate));
      if (Platform.OS === 'android') {
        toggleCheckout();
      }
    } else {
      toggleCheckout();
    }
  };

  const toggleCheckin = () => {
    setIsCheckinDate(!isCheckinDate);
  };

  const toggleCheckout = () => {
    setIsCheckoutDate(!isCheckoutDate);
  };

  return (
    <SafeAreaView>
      <View>
        {isCheckinDate && (
          <DatePicker
            mode="date"
            display="spinner"
            value={dayjs(currDate).toDate()}
            format="DD-MM-YYYY"
            onChange={onCheckinChange}
          />
        )}
        {!isCheckinDate && (
          <Pressable onPress={toggleCheckin}>
            <Text>
              Check In
            </Text>
            <TextInput
              placeholder="Checkin Date"
              value={dayjs(checkInDate).format('DD-MM-YYYY').toString()}
              editable={false}
            />
          </Pressable>
        )}

        {isCheckoutDate && (
          <DatePicker
            mode="date"
            display="spinner"
            format="DD-MM-YYYY"
            value={dayjs(checkInDate).toDate()}
            onChange={onCheckoutChange}
          />
        )}
        {!isCheckoutDate && (
          <Pressable onPress={toggleCheckout}>
            <Text>
              Check Out
            </Text>
            <TextInput
              placeholder="Check Out Date"
              value={dayjs(checkOutDate).format('DD-MM-YYYY').toString()}
              editable={false}
            />
          </Pressable>
        )}

        {options.map((amenity) => (
          <View key={amenity}>
            <Text>{amenity}</Text>
            <Switch
              value={amenities.includes(amenity)}
              onValueChange={() => handleAmenityClick(amenity)}
            />
          </View>
        ))}

        {
          roomType && (
            <Text>
              Select Room Type
            </Text>
          )
        }
        <SelectList
          setSelected={(val) => setRoomType(val)}
          data={roomTypes}
          save="value"
          label="Room Types."
          search={false}
          boxStyles={{ borderRadius: 0 }}
          defaultOption={{ key: '0', value: 'Select Room Type' }}
        />
        <Text></Text>
        <Chip mode="outlined" icon="search-web" onPress={sendSearch}>Search</Chip>
      </View>
    </SafeAreaView>

  );
};

const Rooms = ({ activeTab }) => {
  const [rooms, setRooms] = useState([]);
  const [jwt, setJwt] = useState('');
  const [roomId, setRoomId] = useState(undefined);
  const [bookingDialog, setBookingDialog] = useState(false);
  const [searchDialog, setSearchDialog] = useState(false);
  const [checkInDate, setCheckInDate] = React.useState(dayjs());
  const [checkOutDate, setCheckOutDate] = React.useState(dayjs());
  const [isCheckinDate, setIsCheckinDate] = useState(false);
  const [isCheckoutDate, setIsCheckoutDate] = useState(false);
  const [isAvailable, setIsAvailable] = useState(true);
  const [searching, setSearching] = useState(false);
  const [notAvailable, setNotAvailable] = React.useState(false);
  const [bookingSent, setBookingSent] = React.useState(false);

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        if (!jwt) {
          const token = await AsyncStorage.getItem('jwt');
          if (token) {
            setJwt(token);
          }
        }

        const response = await axios.get(
          'http://10.0.2.2:8080/nexus/api/rooms/rooms',
        );
      } catch (error) {
        console.log(error);
      }
    };

    const searchRooms = async () => {
      if (!jwt) {
        const token = await AsyncStorage.getItem('jwt');
        if (token) {
          setJwt(token);
        }
      }
      const reqBody = {
        checkin: checkin,
        checkout: checkout,
        amenities: searchAmenities,
        type: type,
      };
      console.log(reqBody);
      try {
        fetch('http://10.0.2.2:8080/nexus/api/rooms/search', {
          headers: {
            'Content-Type': 'application/json',
          },
          method: 'post',
          body: JSON.stringify(reqBody),
        })
          .then(response => {
            if (response.status === 200) {
              response.json().then(data => {
                setRooms(data);
                setSearching(false);
              });
            } else if (response.status === 204) {
              console.log('Searched Room Not Available');
            }
          })
          .catch(message => {
            console.log('Error Reading Response');
          });
      } catch (error) {
        console.log('Error Reading Rooms');
      }
    };


    if (activeTab === "Rooms") {
      if (searching) {
        searchRooms();
        hideDialog();

      } else {
        fetchRooms();
      }
    }
  }, [searching, type, searchAmenities, activeTab]);


  const onDismissNASnackBar = () => setNotAvailable(false);
  const onDismissBSSnackBar = () =>setBookingSent(false);

  const confirmation = (roomId) => {
    const requestBody = {
      checkin: checkInDate,
      checkout: checkOutDate,
    };
    try {
      fetch("http://10.0.2.2:8080/nexus/api/rooms/confirmation/" + roomId, {
        headers: {
          "Content-Type": "application/json",
        },
        method: "post",
        body: JSON.stringify(requestBody),
      })
        .then((response) => {
          if (response.status === 200) {
            response.json().then((data) => {
              if (data === true) {
                setIsAvailable(true);
                console.log(data);
              } else if (data === false) {
                setIsAvailable(false);
                setNotAvailable(true);
              }
            });
          }
        })
        .catch((message) => {
          console.log("Error Reading Response ");
        });
    } catch (error) {
      console.log("Error Making booking confirmation");
    }
  };

  const showSearchDialog = () => {
    setBookingDialog(false);
    setSearchDialog(true);
  };

  const toggleCheckin = () => {
    setIsCheckinDate(!isCheckinDate);
  };

  const toggleCheckout = () => {
    setIsCheckoutDate(!isCheckoutDate);
  };

  const showBookingDialog = () => {
    setBookingDialog(true);
    setSearchDialog(false);
  };

  const hideDialog = () => {
    setBookingDialog(false);
    setSearchDialog(false);
  };

  const handleBooking = roomId => {
    setRoomId(roomId);
    showBookingDialog();
    console.log(roomId);
  };

  const onCheckinChange = ({ type }, selectedDate) => {
    if (type === 'set') {
      setCheckInDate(dayjs(selectedDate));
      if (Platform.OS === 'android') {
        toggleCheckin();
      }
    } else {
      toggleCheckin();
    }
  };

  const onCheckoutChange = ({ type }, selectedDate) => {
    if (type === 'set') {
      setCheckOutDate(dayjs(selectedDate));
      if (Platform.OS === 'android') {
        toggleCheckout();
      }
    } else {
      toggleCheckout();
    }
  };

  const updateIsSearching = () => {
    setSearching(true);
    hideDialog();
  };

  const sendBooking = async () => {
    confirmation(roomId);
    hideDialog();
    if (jwt) {
      if (checkin && checkout && roomId) {

        if (isAvailable) {
          const reqBody = {
            checkin: checkInDate,
            checkout: checkOutDate,
            roomId: roomId,
          };
          try {
            await axios.post(
              'http://10.0.2.2:8080/nexus/api/bookings/create/' + jwt,
              reqBody,
            );
            setBookingSent(true);
          } catch (error) {
            console.log('Error Creating A Booking');
          }
        }else{
          setNotAvailable(true);
        }
      }
    }
  };

  const renderCover = (url) => {
    if (url === "1.jpg") {
      return (
        <Card.Cover source={require("../assets/1.jpg")} alt="Photo" />
      );
    } else if (url === "2.jpg") {
      return (
        <Card.Cover source={require("../assets/2.jpg")} alt="Photo" />
      );
    } else if (url === "3.jpg") {
      return (
        <Card.Cover source={require("../assets/3.jpg")} alt="Photo" />
      );
    } else if (url === "4.jpg") {
      return (
        <Card.Cover source={require("../assets/4.jpg")} alt="Photo" />
      );
    } else if (url === "5.jpg") {
      return (
        <Card.Cover source={require("../assets/5.jpg")} alt="Photo" />
      );
    } else if (url === "6.jpg") {
      return (
        <Card.Cover source={require("../assets/6.jpg")} alt="Photo" />
      );
    } else if (url === "7.jpg") {
      return (
        <Card.Cover source={require("../assets/7.jpg")} alt="Photo" />
      );
    } else if (url === "8.jpg") {
      return (
        <Card.Cover source={require("../assets/8.jpg")} alt="Photo" />
      );
    } else if (url === "9.jpg") {
      return (
        <Card.Cover source={require("../assets/9.jpg")} alt="Photo" />
      );
    } else if (url === "10.jpg") {
      return (
        <Card.Cover source={require("../assets/10.jpg")} alt="Photo" />
      );
    } else if (url === "11.jpg") {
      return (
        <Card.Cover source={require("../assets/11.jpg")} alt="Photo" />
      );
    } else if (url === "12.jpg") {
      return (
        <Card.Cover source={require("../assets/12.jpg")} alt="Photo" />
      );
    } else if (url === "13.jpg") {
      return (
        <Card.Cover source={require("../assets/13.jpg")} alt="Photo" />
      );
    }
  }

  return (
    <Background>
      <Chip mode="outlined" icon="search-web" onPress={showSearchDialog}>Search</Chip>
      {rooms.length > 0 ? (
        <FlatList
          style={{ width: '100%' }}
          data={rooms}
          keyExtractor={item => item.id.toString()}
          renderItem={({ item }) => (
            <>
              <Card>
                <Card.Content>
                  <Text>{item.type}</Text>
                  <Text>R.{item.rate}.00</Text>
                </Card.Content>
                {renderCover(item.resource)}
                <Card.Actions>
                  <Button>{item.status}</Button>
                  <Button onPress={() => handleBooking(item.id)}>Book</Button>
                </Card.Actions>
              </Card>
              <Text> </Text>
            </>
          )}
        />
      ) : (
        searching ? (
          <ActivityIndicator animating={true} color={MD2Colors.red800} />
        )
          :
          (
            <Text>Click Search to look for desired room.</Text>
          )
      )}
      <Portal>
        <Dialog
          visible={searchDialog}
          onDismiss={hideDialog}
          style={{ backgroundColor: 'white' }}>
          <Dialog.Content>
            <ScrollView>
              <Search updateIsSearching={updateIsSearching} />
            </ScrollView>
          </Dialog.Content>
        </Dialog>
        <Dialog
          visible={bookingDialog}
          onDismiss={hideDialog}
          style={{ backgroundColor: 'white' }}>
          <Dialog.Title>Book Reservation</Dialog.Title>
          <Dialog.Content>
            <View>
              {isCheckinDate ? (
                <DatePicker
                  mode="date"
                  display="spinner"
                  value={dayjs(checkInDate).toDate()}
                  format="DD-MM-YYYY"
                  onChange={onCheckinChange}
                />
              ) : (
                <Pressable onPress={toggleCheckin}>
                  <Text>
                    Check In
                  </Text>
                  <TextInput
                    placeholder="Enter Checkin Date"
                    value={dayjs(checkInDate).format('DD-MM-YYYY').toString()}
                    editable={false}
                  />
                </Pressable>
              )}

              {isCheckoutDate ? (
                <DatePicker
                  mode="date"
                  display="spinner"
                  value={dayjs(checkOutDate).toDate()}
                  format="DD-MM-YYYY"
                  onChange={onCheckoutChange}
                />
              ) : (
                <Pressable onPress={toggleCheckout}>
                  <Text>
                    Check Out
                  </Text>
                  <TextInput
                    value={dayjs(checkOutDate).format('DD-MM-YYYY').toString()}
                    editable={false}
                  />
                </Pressable>
              )}
            </View>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={sendBooking}>Done</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
      <Snackbar
        visible={notAvailable}
        onDismiss={onDismissNASnackBar}
        theme={{ colors: { primary: 'red' } }}
        action={{
          label: 'info',
          onPress: () => {
            setNotAvailable(false);
          },
        }}>
        Selected Dates Not Available For The Room!.
      </Snackbar>
      <Snackbar
        visible={bookingSent}
        onDismiss={onDismissBSSnackBar}
        theme={{ colors: { primary: 'green' } }}
        action={{
          label: 'info',
          onPress: () => {
            setBookingSent(false);
          },
        }}>
        Booking Sent!.
      </Snackbar>
    </Background>

  );
};

export default Rooms;
