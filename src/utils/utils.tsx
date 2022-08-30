import {Permission, PermissionsAndroid} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import PushNotification from 'react-native-push-notification';

import {
  ASYNC_STORAGE_KEY_CART,
  ASYNC_STORAGE_KEY_USER,
  NOTIFICATION,
} from './constant';
import {SERVER_KEY} from '../config/config';

// store user data in async storage
export const storeUser = async (data: any) => {
  try {
    const jsonValue = JSON.stringify(data);
    await AsyncStorage.setItem(ASYNC_STORAGE_KEY_USER, jsonValue);
  } catch (error) {
    return error;
  }
};

// get user data in async storage
export const getUser = async () => {
  try {
    const jsonValue = await AsyncStorage.getItem(ASYNC_STORAGE_KEY_USER);
    return jsonValue !== null ? JSON.parse(jsonValue) : null;
  } catch (error) {
    return error;
  }
};

// remove user data in async storage
export const removeUser = async () => {
  try {
    return await AsyncStorage.removeItem(ASYNC_STORAGE_KEY_USER);
  } catch (error) {
    return error;
  }
};

// store cart data in async storage
export const storeCart = async (data: any) => {
  try {
    const jsonValue = JSON.stringify(data);
    await AsyncStorage.setItem(ASYNC_STORAGE_KEY_CART, jsonValue);
  } catch (error) {
    return error;
  }
};

// get cart data in async storage
export const getCart = async () => {
  try {
    const jsonValue = await AsyncStorage.getItem(ASYNC_STORAGE_KEY_CART);
    return jsonValue !== null ? JSON.parse(jsonValue) : [];
  } catch (error) {
    return error;
  }
};

// send fcm notification
export const sendPushNotification = async (
  to: string,
  title: string,
  body: string,
) => {
  const message = {
    to: to,
    notification: {
      title: title,
      body: body,
    },
  };

  let headers = new Headers({
    'Content-Type': 'application/json',
    Authorization: 'key=' + SERVER_KEY,
  });

  try {
    let response = await fetch('https://fcm.googleapis.com/fcm/send', {
      method: 'POST',
      headers,
      body: JSON.stringify(message),
    });
    response = await response.json();
    console.log('response ', response);
  } catch (error) {
    console.log('error ', error);
  }
};

// format amount
export const numberWithCommas = (x: number) => {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

// send local notification
export const sendLocalNotification = (title: string, message: string) => {
  PushNotification.localNotification({
    channelId: NOTIFICATION.CHANNEL_ID,
    title: title,
    message: message,
  });
};

export const requestPermission = async (
  title: string,
  message: string,
  permission: Permission,
) => {
  try {
    const granted = await PermissionsAndroid.request(permission, {
      title: title,
      message: message,
      buttonNegative: 'Cancel',
      buttonPositive: 'OK',
    });
    return granted;
  } catch (err) {
    console.warn(err);
  }
};

export const isValidURL = (str: string) => {
  var pattern = new RegExp(
    '^(https?:\\/\\/)?' + // protocol
      '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domain name
      '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
      '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
      '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
      '(\\#[-a-z\\d_]*)?$',
    'i',
  ); // fragment locator
  return !!pattern.test(str);
};
