import React, {useContext, useEffect, useRef, useState} from 'react';
import {
  Box,
  Button,
  Fab,
  FlatList,
  FormControl,
  Icon,
  Input,
  Modal,
  Text,
  WarningOutlineIcon,
} from 'native-base';
import {StyleSheet} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import {Formik} from 'formik';
import * as Yup from 'yup';
import {useIsFocused} from '@react-navigation/native';
import {isNull} from 'lodash';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import GlobalContext from '../../../config/context';
import {AppHeader, Product} from '../../../components';
import {IProduct} from '../../types/types';

const schema = Yup.object().shape({
  name: Yup.string().required('This field is required'),
  address: Yup.string().required('This field is required'),
  paypal_username: Yup.string().required('This field is required'),
  paypal_password: Yup.string().required('This field is required'),
});

const initial = {
  name: '',
  address: '',
  paypal_username: '',
  paypal_password: '',
};

interface IValues {
  name: string;
  address: string;
  paypal_username: string;
  paypal_password: string;
}

const Home = ({navigation}: any) => {
  const {user} = useContext(GlobalContext);
  const [products, setProducts] = useState<IProduct[]>([]);
  const isFocused = useIsFocused();
  const initialRef = useRef(null);
  const finalRef = useRef(null);
  const [isModalVisible, setIsModalVisible] = useState(isNull(user.store));

  useEffect(() => {
    if (isFocused) {
      getProducts();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFocused]);

  const getProducts = () => {
    firestore()
      .collection('products')
      .where('store_id', '==', user.id)
      .get()
      .then(querySnapshot => {
        let holder: any = [];
        querySnapshot.forEach(documentSnapshot => {
          holder.push({
            ...documentSnapshot.data(),
            id: documentSnapshot.id,
          });
        });
        setProducts(holder);
      });
  };

  const submit = (values: IValues) => {
    setIsModalVisible(false);
    navigation.navigate('Map', {storeDetails: values});
  };

  return (
    <Box flex={1} safeArea>
      <Modal
        closeOnOverlayClick={false}
        isOpen={isModalVisible}
        initialFocusRef={initialRef}
        finalFocusRef={finalRef}>
        <Modal.Content>
          <Modal.Header>Store Details</Modal.Header>
          <Formik
            initialValues={initial}
            onSubmit={submit}
            validationSchema={schema}>
            {({handleChange, handleSubmit, values, errors}) => (
              <>
                <Modal.Body>
                  <FormControl isInvalid={'name' in errors}>
                    <FormControl.Label>Store Name</FormControl.Label>
                    <Input
                      value={values.name}
                      onChangeText={handleChange('name')}
                      ref={initialRef}
                    />
                    <FormControl.ErrorMessage
                      ml="3"
                      leftIcon={<WarningOutlineIcon size="xs" />}>
                      {errors.name}
                    </FormControl.ErrorMessage>
                  </FormControl>
                  <FormControl mt="3" isInvalid={'address' in errors}>
                    <FormControl.Label>Store Address</FormControl.Label>
                    <Input
                      value={values.address}
                      onChangeText={handleChange('address')}
                    />
                    <FormControl.ErrorMessage
                      ml="3"
                      leftIcon={<WarningOutlineIcon size="xs" />}>
                      {errors.address}
                    </FormControl.ErrorMessage>
                  </FormControl>
                  <FormControl mt="3" isInvalid={'paypal_username' in errors}>
                    <FormControl.Label>Paypal App Username</FormControl.Label>
                    <Input
                      value={values.paypal_username}
                      onChangeText={handleChange('paypal_username')}
                    />
                    <FormControl.ErrorMessage
                      ml="3"
                      leftIcon={<WarningOutlineIcon size="xs" />}>
                      {errors.paypal_username}
                    </FormControl.ErrorMessage>
                  </FormControl>
                  <FormControl mt="3" isInvalid={'paypal_password' in errors}>
                    <FormControl.Label>Paypal App Password</FormControl.Label>
                    <Input
                      value={values.paypal_password}
                      onChangeText={handleChange('paypal_password')}
                    />
                    <FormControl.ErrorMessage
                      ml="3"
                      leftIcon={<WarningOutlineIcon size="xs" />}>
                      {errors.paypal_password}
                    </FormControl.ErrorMessage>
                  </FormControl>
                </Modal.Body>
                <Modal.Footer>
                  <Button.Group space={2}>
                    <Button onPress={handleSubmit}>Next</Button>
                  </Button.Group>
                </Modal.Footer>
              </>
            )}
          </Formik>
        </Modal.Content>
      </Modal>
      <AppHeader title="Store" isLogoutVisible />
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
        <Box position="relative" w="100%">
          <Fab
            right={20}
            bottom={8}
            icon={
              <Icon
                color="white"
                as={
                  <MaterialCommunityIcons name="format-list-bulleted-square" />
                }
              />
            }
            onPress={() => navigation.navigate('Orders')}
          />
          <Fab
            right={5}
            bottom={20}
            icon={
              <Icon color="white" as={<MaterialCommunityIcons name="plus" />} />
            }
            onPress={() =>
              navigation.navigate('ProductForm', {title: 'Add Product'})
            }
          />
          <Fab
            right={5}
            bottom={5}
            icon={
              <Icon
                color="white"
                as={<MaterialCommunityIcons name="message-outline" />}
              />
            }
            onPress={() => navigation.navigate('Message')}
          />
        </Box>
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

export default Home;
