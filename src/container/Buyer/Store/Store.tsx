import React, {useContext, useEffect, useState} from 'react';
import {Box, Fab, FlatList, Icon, Text} from 'native-base';
import firestore from '@react-native-firebase/firestore';
import {StyleSheet} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {useIsFocused} from '@react-navigation/native';

import {AppHeader, Product} from '../../../components';
import GlobalContext from '../../../config/context';

const Store = ({navigation}) => {
  const {selectedStore} = useContext(GlobalContext);
  const [products, setProducts] = useState([]);
  const isFocused = useIsFocused();

  useEffect(() => {
    firestore()
      .collection('products')
      .where('store_id', '==', selectedStore.id)
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
  }, []);

  return (
    <Box flex={1}>
      <AppHeader
        title={selectedStore?.name}
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
