import React, {useContext, useEffect, useRef, useState} from 'react';
import {Box, Icon, IconButton, Text} from 'native-base';
import MapView, {Marker} from 'react-native-maps';
import Geolocation from '@react-native-community/geolocation';
import firestore from '@react-native-firebase/firestore';

import {AppHeader} from '../../../components';
import {isNull} from 'lodash';
import {REGION} from '../../../utils/constant';
import {StyleSheet} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {removeUser, storeUser} from '../../../utils/utils';
import GlobalContext from '../../../config/context';

const Map = ({navigation, route}) => {
  const {user, setUser} = useContext(GlobalContext);
  const {storeDetails} = route.params;
  const [currentLocation, setCurrentLocation] = useState(null);
  const mapRef = useRef(null);

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

    setTimeout(() => {
      mapRef.current.animateToRegion({
        ...coordinate,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    }, 200);
  };

  const updateStore = () => {
    const store = {
      ...storeDetails,
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
        title="Locate"
        right={
          <IconButton
            icon={
              <Icon color="white" as={MaterialCommunityIcons} name="check" />
            }
            size="lg"
            onPress={updateStore}
          />
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
      </MapView>
    </Box>
  );
};

const styles = StyleSheet.create({
  map: {
    flex: 1,
  },
});

export default Map;
