import React, {useContext, useEffect, useRef, useState} from 'react';
import {
  Actionsheet,
  Box,
  Button,
  Icon,
  IconButton,
  Text,
  VStack,
} from 'native-base';
import MapView, {Marker} from 'react-native-maps';
import Geolocation from '@react-native-community/geolocation';
import firestore from '@react-native-firebase/firestore';

import {AppHeader} from '../../../components';
import {isEqual, isNull} from 'lodash';
import {REGION, USER_BUYER, USER_SELLER} from '../../../utils/constant';
import {Dimensions, StyleSheet} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {removeUser, storeUser} from '../../../utils/utils';
import GlobalContext from '../../../config/context';

const {width, height} = Dimensions.get('window');

const Map = ({navigation, route}) => {
  const {user, setUser, userType} = useContext(GlobalContext);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [stores, setStores] = useState([]);
  const [selectedStore, setSelectedStore] = useState(null);
  const [isSheetVisible, setIsSheetVisible] = useState(true);
  const mapRef = useRef(null);

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
        let holder = [];
        let coordinates = [];
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
        setSelectedStore(holder[1]);
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
    const config = {
      enableHighAccuracy: true,
      timeout: 2000,
      maximumAge: 3600000,
    };
    Geolocation.getCurrentPosition(
      success,
      error => console.log('ERROR', error),
      config,
    );
  }, []);

  const success = info => {
    const coordinate = {
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

  const updateStore = () => {
    const store = {
      ...route.params.storeDetails,
      ...currentLocation,
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

  return (
    <Box flex={1}>
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
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={REGION}
        zoomControlEnabled>
        {!isNull(currentLocation) && (
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
                onPress={() => console.log(store)}
              />
            );
          })}
      </MapView>
      <Actionsheet
        isOpen={isSheetVisible}
        onClose={() => setIsSheetVisible(false)}>
        <Actionsheet.Content>
          <VStack w="100%" p={3} space={2}>
            <Text>{selectedStore?.name}</Text>
            <Text>{selectedStore?.address}</Text>
            <Button
              onPress={() =>
                navigation.navigate('Store', {store: selectedStore})
              }>
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
