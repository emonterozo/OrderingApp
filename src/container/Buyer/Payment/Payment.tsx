import React, {useEffect, useState} from 'react';
import {Box, Center, Spinner, VStack, Text, Alert, Button} from 'native-base';
import {decode, encode} from 'base-64';
import {WebView} from 'react-native-webview';
import qs from 'qs';

import {AppHeader} from '../../../components';
import axios from 'axios';
import {PAYPAL_AUTH} from '../../../config/config';

const Payment = ({navigation, route}) => {
  const {paymentDetails} = route.params;
  const [paypalUrl, setPaypalUrl] = useState('');
  const [accessToken, setAccessToken] = useState('');
  const [payment, setPayment] = useState({
    completed: false,
    status: '',
    title: '',
    message: '',
  });

  useEffect(() => {
    if (!global.btoa) {
      global.btoa = encode;
    }

    if (!global.atob) {
      global.atob = decode;
    }
  }, []);

  useEffect(() => {
    const pay = async () => {
      const url = 'https://api.sandbox.paypal.com/v1/oauth2/token';

      const data = {
        grant_type: 'client_credentials',
      };

      const options = {
        method: 'post',
        headers: {
          'content-type': 'application/x-www-form-urlencoded',
          'Access-Control-Allow-Credentials': true,
        },

        data: qs.stringify(data),
        auth: PAYPAL_AUTH,
        url,
      };

      // Authorize with seller app information (clientId and secret key)
      axios(options)
        .then(response => {
          setAccessToken(response.data.access_token);

          //Request paypal payment (It will load login page payment detail on the way)
          axios
            .post(
              'https://api.sandbox.paypal.com/v1/payments/payment',
              paymentDetails,
              {
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${response.data.access_token}`,
                },
              },
            )
            .then(response => {
              const {id, links} = response.data;
              const approvalUrl = links.find(
                data => data.rel === 'approval_url',
              ).href;

              console.log('response', links);
              setPaypalUrl(approvalUrl);
            })
            .catch(err => {
              console.log('error', {...err});
            });
        })
        .catch(err => {
          console.log('error', {...err});
        });
    };
    pay();
  }, [paymentDetails]);

  const onNavigationStateChange = webViewState => {
    if (webViewState.url.includes('https://example.com/')) {
      setPaypalUrl('');
      const urlArr = webViewState.url.split(/(=|&)/);

      const paymentId = urlArr[2];
      const payerId = urlArr[10];

      axios
        .post(
          `https://api.sandbox.paypal.com/v1/payments/payment/${paymentId}/execute`,
          {payer_id: payerId},
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${accessToken}`,
            },
          },
        )
        .then(() => {
          setPayment({
            completed: true,
            status: 'success',
            title: 'Payment received!',
            message: 'Your payment has been received. Thank you.',
          });
        })
        .catch(() => {
          setPayment({
            completed: true,
            status: 'error',
            title: 'Payment did not received!',
            message: 'Something went wrong. Please try again.',
          });
        });
    }
  };

  return (
    <Box flex={1}>
      <AppHeader hasBack title="Payment" navigation={navigation} />
      {paypalUrl !== '' ? (
        <WebView
          source={{uri: paypalUrl}}
          onNavigationStateChange={onNavigationStateChange}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          startInLoadingState={false}
        />
      ) : !payment.completed ? (
        <Center flex={1}>
          <Spinner size="lg" />
        </Center>
      ) : (
        <Center flex={1}>
          <Alert w="90%" status={payment.status}>
            <VStack space={1} flexShrink={1} w="100%" alignItems="center">
              <Alert.Icon size="md" />
              <Text fontSize="md" fontWeight="medium">
                {payment.title}
              </Text>
              <Box>{payment.message}</Box>
              <Button
                size="sm"
                alignSelf="flex-end"
                onPress={() =>
                  navigation.navigate('Cart', {
                    isPaymentSuccess: payment.status,
                  })
                }>
                OK
              </Button>
            </VStack>
          </Alert>
        </Center>
      )}
    </Box>
  );
};

export default Payment;
