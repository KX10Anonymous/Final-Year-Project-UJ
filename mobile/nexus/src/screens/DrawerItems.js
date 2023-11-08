import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { List } from 'react-native-paper';

const DrawerItems = () => {
  const navigation = useNavigation();


  const handleRoomsClick = () =>{
    navigation.reset({
      index: 0,
      routes: [{ name: 'Rooms' }],
    })
  }

  const handleBookingsClick = () =>{
    navigation.reset({
      index: 0,
      routes: [{ name: 'Bookings' }],
    })
  }

  const handleInvoicesClick = () =>{
    navigation.reset({
      index: 0,
      routes: [{ name: 'Invoices' }],
    })
  }
  return (
    <List.Section>
      <List.Item
        icon="home"
        title="Rooms"
        onPress={handleRoomsClick}
      />
      <List.Item
        icon="book"
        title="Bookings"
        onPress={handleBookingsClick}
      />
      <List.Item
        icon="receipt"
        title="Invoices"
        onPress={handleInvoicesClick}
      />
    </List.Section>
  );
};

export default DrawerItems;
