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
import {StyleSheet} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {isEqual, round} from 'lodash';

import {AppHeader} from '../../../components';
import GlobalContext from '../../../config/context';
import {STATUS, USER_BUYER} from '../../../utils/constant';
import {numberWithCommas, sendPushNotification} from '../../../utils/utils';

interface IOrder {
  name: string;
  orderId: string;
  buyerId: string;
  buyerName: string;
  unitPrice: number;
  quantity: number;
  status: string;
  timestamp: string;
}

interface IItem {
  item: IOrder;
  index: number;
}

const Orders = ({navigation}: any) => {
  const {user, userType} = useContext(GlobalContext);
  const [orders, setOrders] = useState<IOrder[]>([]);
  const [status, setStatus] = useState(STATUS.PROCESSING);
  let row: Array<any> = [];
  let prevOpenedRow: any;

  useEffect(() => {
    getOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  const getOrders = () => {
    firestore()
      .collection('orders')
      .where(
        isEqual(userType, USER_BUYER) ? 'buyer_id' : 'store_id',
        '==',
        user.id,
      )
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
              timestamp: moment(new Date(item.timestamp.seconds * 1000)).format(
                'MMMM DD, YYYY hh:mm A',
              ),
            });
          }),
        );
        setOrders(orderDataHolder);
      });
  };

  const completeOrder = (item: any) => {
    firestore()
      .collection('orders')
      .doc(item.orderId)
      .update({
        status: STATUS.COMPLETED,
      })
      .then(async () => {
        const userData = await firestore()
          .collection('buyers')
          .doc(item.buyerId)
          .get();
        sendPushNotification(
          userData.data().fcm_token,
          'Completed Order',
          `Your order ${item.orderId} is completed`,
        );
        getOrders();
      });
  };

  const renderOrder = ({item, index}: IItem) => {
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
              completeOrder(item);
            }}
          />
        </Box>
      );
    };

    if (isEqual(userType, USER_BUYER)) {
      return renderContent(item);
    } else {
      return (
        <Swipeable
          renderRightActions={() => renderRightActions()}
          onSwipeableOpen={() => closeRow(index)}
          ref={ref => (row[index] = ref)}>
          {renderContent(item)}
        </Swipeable>
      );
    }
  };

  const renderContent = (item: IOrder) => (
    <Box p={3} my={1} borderWidth="1" borderColor="coolGray.300" rounded="8">
      <VStack flex={1} space={1}>
        <HStack space={1}>
          <Text bold>Product:</Text>
          <Text>{item.name}</Text>
        </HStack>
        <HStack space={1}>
          <Text bold>Unit Price:</Text>
          <Text>{`PHP ${numberWithCommas(item.unitPrice)}`}</Text>
        </HStack>
        <HStack space={1}>
          <Text bold>Quantity:</Text>
          <Text>{item.quantity}</Text>
        </HStack>
        <HStack space={1}>
          <Text bold>Amount:</Text>
          <Text>{`PHP ${numberWithCommas(
            round(item.unitPrice * item.quantity),
          )}`}</Text>
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
  );

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
