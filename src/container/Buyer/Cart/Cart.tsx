import React, {useContext, useEffect} from 'react';
import {
  AspectRatio,
  Box,
  Button,
  Center,
  FlatList,
  HStack,
  Icon,
  IconButton,
  Image,
  Text,
  VStack,
} from 'native-base';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {round, sum, sumBy} from 'lodash';
import {StyleSheet} from 'react-native';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import firestore from '@react-native-firebase/firestore';

import GlobalContext from '../../../config/context';

import {
  numberWithCommas,
  sendPushNotification,
  storeCart,
} from '../../../utils/utils';
import {AppHeader} from '../../../components';
import {STATUS} from '../../../utils/constant';
import {ICart} from '../../types/types';

const Cart = ({navigation, route}: any) => {
  const {cart, setCart, user, selectedStore} = useContext(GlobalContext);
  let row: Array<any> = [];
  let prevOpenedRow: any;

  const updateQuantity = (action: string, id: string) => {
    let newCart = cart.map((item: ICart) =>
      item.id === id
        ? {
            ...item,
            quantity: action === 'inc' ? item.quantity + 1 : item.quantity - 1,
          }
        : item,
    );
    setCart(newCart);
    storeCart(newCart);
  };

  const totalItems = () => {
    return sumBy(cart, item => {
      return item.quantity;
    });
  };

  const calculateSum = () => {
    let prices = cart.map(item => item.price * item.quantity);
    return numberWithCommas(round(sum(prices)));
  };

  const renderProduct = ({item, index}) => {
    const closeRow = (i: number) => {
      if (prevOpenedRow && prevOpenedRow !== row[i]) {
        prevOpenedRow.close();
      }
      prevOpenedRow = row[i];
    };

    const renderRightActions = () => {
      return (
        <Box w="25%" justifyContent="center" alignItems="center" m={2}>
          <IconButton
            icon={
              <Icon
                color="white"
                as={MaterialCommunityIcons}
                name="delete-outline"
              />
            }
            bg="red.400"
            size="lg"
            onPress={() => {
              const newCart = cart.filter(product => product.id !== item.id);
              setCart(newCart);
              storeCart(newCart);
            }}
          />
        </Box>
      );
    };

    return (
      <Swipeable
        renderRightActions={() => renderRightActions()}
        onSwipeableOpen={() => closeRow(index)}
        ref={ref => (row[index] = ref)}>
        <Box m="2">
          <HStack space={3}>
            <AspectRatio w="50%">
              <Image
                source={{
                  uri: item.images[0],
                }}
                alt="images"
              />
            </AspectRatio>
            <VStack flex={1} justifyContent="space-between">
              <VStack space={1}>
                <Text>{item.name}</Text>
                <Text numberOfLines={3}>{item.description}</Text>
              </VStack>
              <HStack justifyContent="space-between">
                <Text fontWeight="600" color="red.600">
                  {`PHP ${numberWithCommas(round(item.price * item.quantity))}`}
                </Text>
                <HStack space={2} alignItems="center">
                  <IconButton
                    size="xs"
                    bg="warmGray.300"
                    icon={
                      <Icon
                        as={MaterialCommunityIcons}
                        name="minus"
                        size="sm"
                      />
                    }
                    disabled={item.quantity <= 1}
                    onPress={() => updateQuantity('dec', item.id)}
                  />
                  <Text>{item.quantity}</Text>
                  <IconButton
                    size="xs"
                    bg="warmGray.300"
                    icon={
                      <Icon as={MaterialCommunityIcons} name="plus" size="sm" />
                    }
                    onPress={() => updateQuantity('inc', item.id)}
                  />
                </HStack>
              </HStack>
            </VStack>
          </HStack>
        </Box>
      </Swipeable>
    );
  };

  const handlePressCheckout = async () => {
    const shippingFee = 6;
    let total = 0;

    const items = cart.map(item => {
      const itemPrice = parseFloat(item.price) * item.quantity;
      total += itemPrice;
      return {
        name: item.name,
        description: item.description,
        quantity: item.quantity,
        price: item.price,
        tax: '0',
        sku: item.id,
        currency: 'USD',
      };
    });

    const paymentDetails = {
      intent: 'sale',
      payer: {
        payment_method: 'paypal',
      },
      transactions: [
        {
          amount: {
            currency: 'USD',
            total: total + shippingFee,
            details: {
              shipping: shippingFee,
              subtotal: total,
              shipping_discount: '0',
              insurance: '0',
              handling_fee: '0',
              tax: '0',
            },
          },
          description: `${new Date()}, This is payment for the store ${
            cart[0].store_id
          }.`,
          payment_options: {
            allowed_payment_method: 'IMMEDIATE_PAY',
          },
          item_list: {
            items: items,
          },
        },
      ],
      redirect_urls: {
        return_url: 'https://example.com/',
        cancel_url: 'https://example.com/',
      },
    };

    navigation.navigate('Payment', {paymentDetails: paymentDetails});
  };

  useEffect(() => {
    if (route.params) {
      const {isPaymentSuccess} = route.params;
      if (isPaymentSuccess) {
        let count = 0;

        cart.map((item, index) => {
          firestore()
            .collection('orders')
            .add({
              buyer_id: user.id,
              buyer_name: user.name,
              product_id: item.id,
              quantity: item.quantity,
              status: STATUS.PROCESSING,
              store_id: item.store_id,
              timestamp: new Date(),
              unit_price: item.price,
            })
            .then(async () => {
              count = index;

              if (count === cart.length - 1) {
                setCart([]);
                storeCart([]);

                sendPushNotification(
                  selectedStore.fcmToken,
                  'New Order',
                  `Your received new order's from ${user.name}`,
                );
              }
            });
        });
      }
    }
  }, [route]);

  return (
    <Box flex={1}>
      <AppHeader hasBack title="Cart" navigation={navigation} />
      <FlatList
        data={cart}
        renderItem={renderProduct}
        contentContainerStyle={cart.length <= 0 && styles.empty}
        ListEmptyComponent={
          <Center>
            <Text fontSize="md" bold color="warmGray.500">
              Your cart is currently empty
            </Text>
          </Center>
        }
      />
      <HStack
        alignItems="center"
        justifyContent="space-between"
        p={3}
        borderTopWidth={1}
        borderColor="warmGray.600">
        <Text fontWeight="600" fontSize="lg" color="red.600">
          {`PHP ${calculateSum()}`}
        </Text>
        <Button
          w="50%"
          borderRadius="full"
          disabled={!cart.length}
          colorScheme={cart.length ? 'cyan' : 'gray'}
          onPress={handlePressCheckout}>
          {`Checkout (${totalItems()})`}
        </Button>
      </HStack>
    </Box>
  );
};

const styles = StyleSheet.create({
  empty: {
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default Cart;
