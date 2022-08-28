import React, {useContext, useEffect, useState} from 'react';
import {
  Badge,
  Box,
  FlatList,
  HStack,
  Icon,
  IconButton,
  Text,
  VStack,
  Select,
  CheckIcon,
} from 'native-base';
import moment from 'moment';
import firestore from '@react-native-firebase/firestore';
import Swipeable from 'react-native-gesture-handler/Swipeable';

import {AppHeader} from '../../../components';
import {isEqual} from 'lodash';
import GlobalContext from '../../../config/context';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {STATUS} from '../../../utils/constant';
import {StyleSheet} from 'react-native';

const Orders = ({navigation}) => {
  const {user} = useContext(GlobalContext);
  const [orders, setOrders] = useState([]);
  const [status, setStatus] = useState(STATUS.PROCESSING);
  let row: Array<any> = [];
  let prevOpenedRow: any;

  useEffect(() => {
    getOrders();
  }, [status]);

  const getOrders = () => {
    firestore()
      .collection('orders')
      .where('store_id', '==', user.id)
      .where('status', '==', status)
      .get()
      .then(async orderSnapshot => {
        let ordersHolder: any[] = [];

        orderSnapshot.forEach(doc => {
          ordersHolder.push({
            ...doc.data(),
            id: doc.id,
          });
        });

        let orderDataHolder: any[] = [];
        await Promise.all(
          ordersHolder.map(async item => {
            // will get information of the product
            const product = await firestore()
              .collection('products')
              .doc(item.product_id)
              .get();

            orderDataHolder.push({
              name: product.data().name,
              orderId: item.id,
              buyerId: item.buyer_id,
              buyerName: item.buyer_name,
              unitPrice: item.unit_price,
              quantity: item.quantity,
              status: item.status,
              timestamp: moment(item.timestamp).format('MMMM DD, YYYY hh:mm A'),
            });
          }),
        );
        setOrders(orderDataHolder);
      });
  };

  const completeOrder = (id: string) => {
    firestore()
      .collection('orders')
      .doc(id)
      .update({
        status: STATUS.COMPLETED,
      })
      .then(() => {
        getOrders();
      });
  };

  const renderOrder = ({item, index}) => {
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
              <Icon color="white" as={MaterialCommunityIcons} name="check" />
            }
            disabled={isEqual(item.status, STATUS.COMPLETED)}
            bg={
              isEqual(item.status, STATUS.PROCESSING)
                ? 'success.500'
                : 'warmGray.600'
            }
            size="lg"
            onPress={() => {
              closeRow(index - 1);
              completeOrder(item.orderId);
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
        <Box
          p={3}
          my={1}
          borderWidth="1"
          borderColor="coolGray.300"
          rounded="8">
          <VStack flex={1} space={1}>
            <HStack space={1}>
              <Text bold>Product:</Text>
              <Text>{item.name}</Text>
            </HStack>
            <HStack space={1}>
              <Text bold>Unit Price:</Text>
              <Text>{`PHP ${item.unitPrice}`}</Text>
            </HStack>
            <HStack space={1}>
              <Text bold>Quantity:</Text>
              <Text>{item.quantity}</Text>
            </HStack>
            <HStack space={1}>
              <Text bold>Amount:</Text>
              <Text>{`PHP ${item.unitPrice * item.quantity}`}</Text>
            </HStack>
            <HStack space={1}>
              <Text bold>Timestamp:</Text>
              <Text>{item.timestamp}</Text>
            </HStack>
            <HStack space={1}>
              <Text bold>Order by:</Text>
              <Text>{item.buyerName}</Text>
            </HStack>
            <Badge
              alignSelf="flex-end"
              p="1"
              w="40%"
              variant="solid"
              borderRadius="full"
              colorScheme={
                isEqual(item.status, STATUS.PROCESSING) ? 'yellow' : 'success'
              }>
              <Text italic color="white">
                {item.status}
              </Text>
            </Badge>
          </VStack>
        </Box>
      </Swipeable>
    );
  };

  return (
    <Box flex={1} safeArea>
      <AppHeader title="Orders" hasBack navigation={navigation} />
      <Box flex={1} mx={2}>
        <Box my={2} alignItems="flex-end">
          <Select
            w="80%"
            selectedValue={status}
            minWidth="200"
            accessibilityLabel="Choose Service"
            placeholder="Choose Service"
            _selectedItem={{
              bg: 'teal.600',
              endIcon: <CheckIcon size="5" />,
            }}
            mt={1}
            onValueChange={itemValue => setStatus(itemValue)}>
            <Select.Item label="Processing" value={STATUS.PROCESSING} />
            <Select.Item label="Completed" value={STATUS.COMPLETED} />
          </Select>
        </Box>
        <FlatList
          data={orders}
          contentContainerStyle={orders.length <= 0 && styles.empty}
          renderItem={renderOrder}
          ListEmptyComponent={
            <Text bold color="warmGray.400">
              {`No ${status} orders`}
            </Text>
          }
        />
      </Box>
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

export default Orders;
