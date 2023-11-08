import * as React from 'react';
import { BottomNavigation } from 'react-native-paper';
import Bookings from './Bookings';
import Invoices from './Invoices';
import Logout from './Logout';
import Rooms from './Rooms';
import Notifications from './Notifications';

const Dashboard = () => {
  
  const [index, setIndex] = React.useState(0);
  const [activeTab, setActivetTab] = React.useState("Rooms");
  const [routes] = React.useState([
    { key: 'rooms', title: 'Rooms', focusedIcon: 'home-group', unfocusedIcon: 'home'},
    { key: 'bookings', title: 'Bookings', focusedIcon: 'bed-outline' },
    { key: 'invoices', title: 'Invoices', focusedIcon: 'cash-register' },
    { key: 'notifications', title: 'Notifications', focusedIcon: 'bell', unfocusedIcon: 'bell-outline' },
    { key: 'logout', title: 'Logout', focusedIcon: 'logout' },
  ]);

  React.useEffect(() => {
    if(index === 0){
      setActivetTab("Rooms");
    }else if(index === 1){
      setActivetTab("Bookings");
    }else if(index === 2){
      setActivetTab("Invoices");
    }else if(index === 3){
      setActivetTab("Notifications");
    }
  }, [index]);


  const renderScene = BottomNavigation.SceneMap({
    rooms: () => <Rooms activeTab={activeTab}/>,
    bookings: () => <Bookings activeTab={activeTab}/>,
    invoices: () => <Invoices activeTab={activeTab}/>,
    notifications: () => <Notifications activeTab={activeTab}/>,
    logout: () => <Logout />,
  });

  return (
    <BottomNavigation
      navigationState={{ index, routes }}
      onIndexChange={setIndex}
      renderScene={renderScene}
    />
  );
};

export default Dashboard;
