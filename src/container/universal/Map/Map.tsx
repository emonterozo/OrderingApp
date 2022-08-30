import React, {useContext, useEffect, useRef, useState} from 'react';
import {
  Actionsheet,
  Box,
  Button,
  Fab,
  Icon,
  IconButton,
  Input,
  Text,
  VStack,
  Modal,
  FormControl,
} from 'native-base';
import {
  Dimensions,
  PermissionsAndroid,
  StyleSheet,
  Platform,
} from 'react-native';
import MapView, {Marker} from 'react-native-maps';
import Geolocation from '@react-native-community/geolocation';
import firestore from '@react-native-firebase/firestore';
import {useIsFocused} from '@react-navigation/native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {isEmpty, isEqual, isNull} from 'lodash';

import {AppHeader} from '../../../components';
import {REGION, USER_BUYER, USER_SELLER} from '../../../utils/constant';
import {requestPermission, storeUser} from '../../../utils/utils';
import GlobalContext from '../../../config/context';

const {width, height} = Dimensions.get('window');

interface ICoordinate {
  latitude: number;
  longitude: number;
}

interface IStore {
  id: string;
  name: string;
  address: string;
  coordinate: ICoordinate;
}

const Map = ({navigation, route}: any) => {
  const {user, setUser, userType} = useContext(GlobalContext);
  const [currentLocation, setCurrentLocation] = useState<ICoordinate>(null);
  const [stores, setStores] = useState<IStore[]>([]);
  const [selectedStore, setSelectedStore] = useState<IStore>(null);
  const [isSheetVisible, setIsSheetVisible] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(isEmpty(user.name));
  const [name, setName] = useState('');
  const mapRef: any = useRef(null);
  const isFocused = useIsFocused();

  useEffect(() => {
    if (isEqual(userType, USER_BUYER)) {
      getStores();
    }
  }, [userType]);

  const getStores = () => {
    firestore()
      .collection('sellers')
      .get()
      .then(querySnapshot => {
        let holder: IStore[] = [];
        let coordinates: ICoordinate[] = [];
        querySnapshot.forEach(documentSnapshot => {
          if (!isNull(documentSnapshot.data().store)) {
            holder.push({
              ...documentSnapshot.data().store,
              id: documentSnapshot.id,
            });
            coordinates.push({
              latitude: documentSnapshot.data().store.coordinate.latitude,
              longitude: documentSnapshot.data().store.coordinate.longitude,
            });
          }
        });
        setStores(holder);
        setTimeout(() => {
          mapRef.current.fitToCoordinates(coordinates, {
            edgePadding: {
              right: width / 20,
              bottom: height / 20,
              left: width / 20,
              top: height / 20,
            },
          });
        }, 500);
      });
  };

  useEffect(() => {
    // will get user location
    checkPlatform();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const checkPlatform = async () => {
    if (Platform.OS === 'android') {
      const status = await requestPermission(
        'Ordering App request permission',
        'Ordering App need to access your current location',
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      );

      if (status === PermissionsAndroid.RESULTS.GRANTED) {
        getLocation();
      }
    } else {
      getLocation();
    }
  };

  const getLocation = async () => {
    const config = {
      enableHighAccuracy: false,
      timeout: 5000,
      //maximumAge: 3600000,
    };
    Geolocation.getCurrentPosition(
      success,
      error => console.log(error),
      config,
    );
  };

  // get user location success
  const success = (info: any) => {
    const coordinate: ICoordinate = {
      latitude: info.coords.latitude,
      longitude: info.coords.longitude,
    };
    setCurrentLocation(coordinate);

    if (isEqual(userType, USER_SELLER)) {
      setTimeout(() => {
        mapRef.current.animateToRegion({
          ...coordinate,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        });
      }, 200);
    }
  };

  // update store details
  const updateStore = () => {
    const store = {
      ...route.params.storeDetails,
      coordinate: new firestore.GeoPoint(
        currentLocation.latitude,
        currentLocation.longitude,
      ),
    };

    firestore()
      .collection('sellers')
      .doc(user.id)
      .update({
        store: store,
      })
      .then(() => {
        let updatedUser = {
          ...user,
        };
        updatedUser.store = store;
        setUser(updatedUser);
        storeUser(updatedUser);
        navigation.navigate('SellerHome');
      });
  };

  // update buyer details
  const updateName = () => {
    if (!isEmpty(name)) {
      firestore()
        .collection('buyers')
        .doc(user.id)
        .update({
          name: name,
        })
        .then(() => {
          const userData = {
            ...user,
            name: name,
          };
          setUser(userData);
          storeUser(userData);
          setIsModalVisible(false);
        });
    }
  };

  return (
    <Box flex={1} safeArea>
      {isEqual(userType, USER_BUYER) && (
        <Modal isOpen={isModalVisible}>
          <Modal.Content>
            <Modal.Header>Input name</Modal.Header>
            <Modal.Body>
              <FormControl>
                <FormControl.Label>Name</FormControl.Label>
                <Input value={name} onChangeText={setName} />
              </FormControl>
            </Modal.Body>
            <Modal.Footer>
              <Button.Group space={2}>
                <Button onPress={updateName}>Update</Button>
              </Button.Group>
            </Modal.Footer>
          </Modal.Content>
        </Modal>
      )}
      <AppHeader
        title={isEqual(userType, USER_BUYER) ? 'Stores' : 'Locate'}
        isLogoutVisible={isEqual(userType, USER_BUYER)}
        right={
          isEqual(userType, USER_SELLER) && (
            <IconButton
              icon={
                <Icon color="white" as={MaterialCommunityIcons} name="check" />
              }
              size="lg"
              onPress={updateStore}
            />
          )
        }
      />
      <MapView ref={mapRef} style={styles.map} initialRegion={REGION}>
        {!isNull(currentLocation) && isEqual(userType, USER_SELLER) && (
          <Marker
            onDragEnd={e => setCurrentLocation(e.nativeEvent.coordinate)}
            draggable
            coordinate={currentLocation}
          />
        )}
        {stores.length > 0 &&
          stores.map(store => {
            return (
              <Marker
                key={store.id}
                coordinate={{
                  latitude: store.coordinate.latitude,
                  longitude: store.coordinate.longitude,
                }}
                onPress={() => {
                  setSelectedStore(store);
                  setIsSheetVisible(true);
                }}
              />
            );
          })}
      </MapView>
      {isEqual(userType, USER_BUYER) && isFocused && (
        <Box position="relative" w="100%">
          <Fab
            right={5}
            bottom={20}
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
      <Actionsheet
        isOpen={isSheetVisible}
        onClose={() => setIsSheetVisible(false)}>
        <Actionsheet.Content>
          <VStack w="100%" p={3} space={2}>
            <Text>{selectedStore?.name}</Text>
            <Text>{selectedStore?.address}</Text>
            <Button
              onPress={() => {
                setIsSheetVisible(false);
                navigation.navigate('Store', {store: selectedStore});
              }}>
              View Store
            </Button>
          </VStack>
        </Actionsheet.Content>
      </Actionsheet>
    </Box>
  );
};

const styles = StyleSheet.create({
  map: {
    flex: 1,
  },
});

export default Map;
