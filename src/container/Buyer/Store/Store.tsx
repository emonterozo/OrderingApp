import React, {useEffect, useState} from 'react';
import {
  AspectRatio,
  Box,
  Fab,
  FlatList,
  Heading,
  Icon,
  IconButton,
  Image,
  Pressable,
  Stack,
  Text,
} from 'native-base';
import firestore from '@react-native-firebase/firestore';

import {AppHeader, Product} from '../../../components';
import {isNull} from 'lodash';
import {StyleSheet} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {useIsFocused} from '@react-navigation/native';

const Store = ({navigation, route}) => {
  const {store} = route.params;
  const [products, setProducts] = useState([]);
  const isFocused = useIsFocused();

  useEffect(() => {
    getProducts();
  }, []);

  const getProducts = () => {
    firestore()
      .collection('products')
      .where('store_id', '==', store.id)
      .get()
      .then(querySnapshot => {
        let holder = [];
        querySnapshot.forEach(documentSnapshot => {
          holder.push({
            ...documentSnapshot.data(),
            id: documentSnapshot.id,
          });
        });
        setProducts(holder);
      });
  };

  return (
    <Box flex={1}>
      <AppHeader
        title={store.name}
        hasBack
        navigation={navigation}
        isCartVisible
      />
      <FlatList
        columnWrapperStyle={styles.flatList}
        data={products}
        renderItem={({item}) => <Product item={item} navigation={navigation} />}
        numColumns={2}
        contentContainerStyle={products.length <= 0 && styles.empty}
        ListEmptyComponent={
          <Box>
            <Text bold color="warmGray.400">
              No available products
            </Text>
          </Box>
        }
      />
      {isFocused && (
        <Fab
          placement="bottom-right"
          icon={
            <Icon
              color="white"
              as={<MaterialCommunityIcons name="message-outline" />}
            />
          }
          onPress={() =>
            navigation.navigate('Chat', {toUser: store.id, name: store.name})
          }
        />
      )}
    </Box>
  );
};

const styles = StyleSheet.create({
  flatList: {
    margin: 5,
    justifyContent: 'space-between',
  },
  empty: {
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default Store;
