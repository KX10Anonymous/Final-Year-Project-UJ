import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { FlatList, Text, View } from 'react-native';
import { Card, Chip, Provider, Button, ActivityIndicator, MD2Colors } from 'react-native-paper';
import Background from '../components/Background';
import dayjs from 'dayjs';
import RNFetchBlob from 'rn-fetch-blob';
import Share from 'react-native-share';

const theme = {
  primaryColor: '#FFA500',
  secondaryColor: '#FFD700',
  backgroundColor: '#FFF',
  textColor: '#333',
};

const Invoices = ({ activeTab }) => {
  let read = true;
  const [invoices, setInvoices] = useState([]);
  const [token, setToken] = useState('');
  const [changed, setChanged] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInvoices = async () => {
      if (token) {
        axios
          .get('http://10.0.2.2:8080/nexus/api/invoices/all/' + token)
          .then(response => {
            setInvoices(response.data);
          });
        setLoading(false);
      } else {
        const jwt = await AsyncStorage.getItem('jwt');
        setToken(jwt);
      }
    };
    if (activeTab === "Invoices") {
      fetchInvoices();
    }
  }, [read, token, changed, activeTab]);


  const generatePdf = async (invoiceId) => {
    try {
      await fetch(
        "http://10.0.2.2:8080/nexus/api/invoices/regenerate/" + invoiceId,
        {
          headers: {
            "Content-Type": "application/json",
          },
          method: "GET",
        }
      )
        .then((response) => {
          if (response.status === 200) {
            setChanged(!changed);
          }
        })
        .catch((message) => {
          console.log("Error Reading Response");
        });
    } catch (error) {
      console.log("Error Reading Guests");
    }
    setChanged(!changed);
  };


  const downloadInvoice = (invoiceName) => {
    const url = "http://10.0.2.2:8080/nexus/api/invoices/download/" + invoiceName;
    const downloadPath = RNFetchBlob.fs.dirs.DownloadDir + '/' + invoiceName;
    RNFetchBlob
      .config({
        fileCache: true,
        path: downloadPath,
      })
      .fetch('GET', url)
      .then((res) => {
        Share.open({
          url: `file://${downloadPath}`,
          type: 'application/pdf', 
        })
          .then((res) => {
            console.log('File Shared Successfully.....');
          })
          .catch((error) => {
            console.log("Error Sharing File");
          });
      })
      .catch((error) => {
        console.log("Error Opening Invoice");
      });
  }
  

  return (
    <Provider theme={theme}>
      <Background>
        <View>
          {invoices.length > 0 ? (
            <FlatList
              style={{ width: '100%' }}
              data={invoices}
              keyExtractor={item => item.id.toString()}
              renderItem={({ item }) => (
                <>
                  <Provider theme={theme}>
                    <Card style={{ width: '100%' }}>
                      <Card.Content>
                        <Chip mode="outlined" icon="calendar-multiselect">Date: {dayjs(item.created).format('DD-MM-YYYY').toString()}</Chip>
                        <Chip mode="outlined" icon="account-circle">Guest: {item.guest}</Chip>
                        <Chip mode="outlined" icon="calendar-end">Number of Days Stayed: {item.days}</Chip>
                        <Chip mode="outlined" icon="cash">Total: R {item.total}.00</Chip>
                      </Card.Content>
                      <Card.Actions>
                        {item.fileName ? (
                          <Button onPress={() => downloadInvoice(item.fileName)}>Download Invoice</Button>
                        ) : (
                          <Button onPress={() => generatePdf(item.id)}>Generate Invoice</Button>
                        )}

                      </Card.Actions>
                    </Card>
                  </Provider>
                  <Text> </Text>
                </>
              )}
            />
          ) : (
            loading &&(
              <ActivityIndicator animating={true} color={MD2Colors.red800} />
            )
          )}
        </View>
      </Background>
     
    </Provider>
  );
};

export default Invoices;
