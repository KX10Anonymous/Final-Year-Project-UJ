import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { FlatList, Text, View, Pressable } from 'react-native';
import { Card, Chip, Provider, ActivityIndicator, MD2Colors } from 'react-native-paper';
import Background from '../components/Background';
import dayjs from 'dayjs';

const theme = {
    primaryColor: '#FFA500',
    secondaryColor: '#FFD700',
    backgroundColor: '#FFF',
    textColor: '#333',
};

const Notifications = ({ activeTab }) => {
    const [notifications, setNotifications] = useState([]);
    const [token, setToken] = useState('');
    const [changed, setChanged] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchNotifications = async () => {
            if (token) {
                axios
                    .get('http://10.0.2.2:8080/nexus/api/notifications/all/' + token)
                    .then(response => {
                        setNotifications(response.data);
                        setLoading(false);
                    });
            } else {
                const jwt = await AsyncStorage.getItem('jwt');
                setToken(jwt);
            }
        };
        if (activeTab === "Notifications") {
             fetchNotifications();
        }
    }, [activeTab, changed, token]);

    const readNotification = async (notificationId) => {
        try {

            const reqBody = {
                id: notificationId,
            };
            await fetch(
                "http://10.0.2.2:8080/nexus/api/notifications/update/" + token,
                {
                    headers: {
                        "Content-Type": "application/json",
                    },
                    method: "PUT",
                    body: JSON.stringify(reqBody),
                }
            )
                .then((response) => {
                    if (response.status === 200) {
                        setChanged(!changed);
                    }
                })
                .catch((message) => {
                    console.log("Error Updating Notification");
                });
        } catch (error) {
            console.log("Error Connecting to Notification Update Service");
        }
    };

    return (
        <Provider theme={theme}>
            <Background>
                <View>
                    {notifications.length > 0 ? (
                        <FlatList
                            style={{ width: '100%' }}
                            data={notifications}
                            keyExtractor={item => item.id.toString()}
                            renderItem={({ item }) => (
                                <>
                                    <Provider theme={theme}>
                                        <Card style={{ width: '100%' }}>
                                            <Card.Content>
                                                <Pressable onPress={() => readNotification(item.id)}>
                                                    <Text>{item.message}</Text>
                                                    <Chip mode="outlined" icon="calendar-multiselect">{dayjs(item.created).format('DD-MM-YYYY-HH-mm').toString()}</Chip>
                                                </Pressable>
                                            </Card.Content>
                                        </Card>
                                    </Provider>
                                    <Text> </Text>
                                </>
                            )}
                        />
                    ) : (
                        loading ? (
                            <ActivityIndicator animating={true} color={MD2Colors.red800} />
                        )
                            :
                            (
                                <Text>No Notifications</Text>
                            )

                    )}
                </View>
            </Background>
        </Provider>
    );
};

export default Notifications;
