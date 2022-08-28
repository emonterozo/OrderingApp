import React, {useContext, useEffect, useRef, useState} from 'react';
import {
  AspectRatio,
  Badge,
  Box,
  Button,
  Divider,
  Fab,
  FlatList,
  FormControl,
  Heading,
  HStack,
  Icon,
  Image,
  Input,
  Modal,
  Pressable,
  Stack,
  Text,
  VStack,
  WarningOutlineIcon,
} from 'native-base';
import firestore from '@react-native-firebase/firestore';
import {Formik} from 'formik';
import * as Yup from 'yup';

import GlobalContext from '../../../config/context';
import {AppHeader} from '../../../components';
import {StyleSheet} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {useIsFocused} from '@react-navigation/native';
import {isEqual, isNull, omit} from 'lodash';
import moment from 'moment';

const schema = Yup.object().shape({
  name: Yup.string().required('This field is required'),
  address: Yup.string().required('This field is required'),
});

const initial = {
  name: '',
  address: '',
};

const Home = ({navigation}) => {
  const {user} = useContext(GlobalContext);
  const [products, setProducts] = useState([]);
  const isFocused = useIsFocused();
  const initialRef = useRef(null);
  const finalRef = useRef(null);

  useEffect(() => {
    if (isFocused) {
      getProducts();
    }
  }, [isFocused]);

  const getProducts = () => {
    firestore()
      .collection('products')
      .where('store_id', '==', user.id)
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

  const renderProduct = ({item}) => (
    <Pressable
      flex={1}
      maxWidth="49%"
      borderWidth="1"
      borderColor="coolGray.300"
      rounded="8"
      onPress={() =>
        navigation.navigate('ProductDetails', {
          product: item,
        })
      }>
      <AspectRatio w="100%">
        <Image
          source={{
            uri: item.images[0],
          }}
          alt={item.name}
        />
      </AspectRatio>
      <Stack p="3" space={3} flex={1}>
        <Stack space={2}>
          <Heading size="md" ml="-1">
            {item.name}
          </Heading>
        </Stack>
        <Text numberOfLines={3} fontWeight="400">
          {item.description}
        </Text>
        <Box flex={1} justifyContent="flex-end" alignItems="flex-end">
          <Text color="coolGray.600" fontWeight="bold">
            {`PHP ${item.price}`}
          </Text>
        </Box>
      </Stack>
    </Pressable>
  );

  const submit = values => {
    navigation.navigate('Map', {storeDetails: values});
  };

  return (
    <Box flex={1} safeArea>
      <Modal
        closeOnOverlayClick={false}
        isOpen={isNull(user.store)}
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
        renderItem={renderProduct}
        numColumns={2}
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
});

export default Home;
