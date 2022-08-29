import React, {
  useState,
  useLayoutEffect,
  useCallback,
  useContext,
  useEffect,
} from 'react';
import {GiftedChat} from 'react-native-gifted-chat';
import {xor, isEqual} from 'lodash';

import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

import GlobalContext from '../../../config/context';
import {AppHeader} from '../../../components';
import {USER_BUYER, USER_SELLER} from '../../../utils/constant';
import {Box} from 'native-base';

const Chat = ({route, navigation}) => {
  const {user, userType} = useContext(GlobalContext);
  const toUser = route.params?.toUser;

  const [messages, setMessages] = useState([]);
  const [conversationId, setConversationId] = useState(
    route.params?.conversationId,
  );

  useLayoutEffect(() => {
    if (conversationId) {
      const subscriber = firestore()
        .collection(`messages/${conversationId}/chats`)
        .orderBy('timestamp', 'desc')
        .onSnapshot(async documentSnapshot => {
          let messagesData: any[] = [];

          documentSnapshot.forEach(doc => {
            messagesData.push(doc.data());
          });
          console.log('userget', messagesData);

          let messagesDataHolder: any[] = [];
          await Promise.all(
            messagesData.map(async (item, i) => {
              const userData = await firestore()
                .collection(
                  isEqual(item.user_type, USER_BUYER) ? 'buyers' : 'sellers',
                )
                .doc(item.user)
                .get();

              messagesDataHolder.push({
                _id: i,
                createdAt: item.timestamp.toDate(),
                text: item.message,
                user: {
                  _id: userData.id,
                  name: userData.data().name,
                },
              });
            }),
          );

          const data = messagesDataHolder.sort((a, b) => {
            return new Date(b.createdAt) - new Date(a.createdAt);
          });

          setMessages(data);
        });

      // Stop listening for updates when no longer required
      return () => subscriber();
    } else {
      firestore()
        .collection('messages')
        .get()
        .then(querySnapshot => {
          let messagesData = [];
          querySnapshot.forEach(doc => {
            if (
              isEqual(
                doc.data().conversation_between.sort(),
                [toUser, user.id].sort(),
              )
            ) {
              messagesData.push({
                ...doc.data(),
                id: doc.id,
              });
            }
          });

          //console.log("messagesDatadsdsadas", messagesData);
          if (messagesData.length > 0) {
            setConversationId(messagesData[0].id);
          }
        });
    }
  });

  const onSend = useCallback(
    (message = []) => {
      //console.log(message);
      setMessages(previousMessages =>
        GiftedChat.append(previousMessages, message),
      );
      const {_id, createdAt, text} = message[0];

      if (conversationId) {
        console.log('reply to  message');
        firestore()
          .collection(`messages/${conversationId}/chats`)
          .add({
            user: user.id,
            user_type: userType,
            message: text,
            timestamp: createdAt,
          })
          .then(() => {
            firestore().collection('messages').doc(conversationId).update({
              timestamp: createdAt,
              last_message: text,
            });
          });
      } else {
        if (toUser) {
          console.log('new message');
          firestore()
            .collection('messages')
            .add({
              from: user.id,
              from_user_type: userType,
              to: toUser,
              to_user_type: isEqual(userType, USER_BUYER)
                ? USER_SELLER
                : USER_BUYER,
              timestamp: createdAt,
              last_message: text,
              conversation_between: [user.id, toUser],
            })
            .then(dofRef => {
              console.log(dofRef.id);
              setConversationId(dofRef.id);
              firestore().collection(`messages/${dofRef.id}/chats`).add({
                user: user.id,
                user_type: userType,
                message: text,
                timestamp: createdAt,
              });
            });
        }
      }
    },
    [conversationId, toUser],
  );

  return (
    <>
      <AppHeader
        title={route.params?.name || 'Message'}
        hasBack
        navigation={navigation}
      />
      <GiftedChat
        messages={messages}
        onSend={message => onSend(message)}
        user={{
          _id: user.id,
        }}
        textInputProps={{
          color: 'black',
        }}
      />
    </>
  );
};

export default Chat;
