import React, {useContext, useEffect, useState} from 'react';
import {StyleSheet, FlatList} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import moment from 'moment';
import {Avatar, Box, Center, HStack, Pressable, Text} from 'native-base';

import {CommentsRegular} from '../../../assets/svg';
import GlobalContext from '../../../config/context';
import {AppHeader} from '../../../components';

interface IMessage {
  conversation_between: string[];
  from: string;
  fromUser: string;
  from_user_type: string;
  id: string;
  last_message: string;
  timestamp: any;
  to: string;
  toUser: string;
  to_user_type: string;
}

interface IItem {
  item: IMessage;
}

const Message = ({navigation}: any) => {
  const {user} = useContext(GlobalContext);
  const [conversation, setConversation] = useState<IMessage[]>([]);

  useEffect(() => {
    const subscriber = firestore()
      .collection('messages')
      .where('conversation_between', 'array-contains', user.id)
      .orderBy('timestamp', 'desc')
      .onSnapshot(async querySnapshot => {
        let messagesData: any[] = [];

        querySnapshot?.forEach(doc => {
          messagesData.push({
            ...doc.data(),
            id: doc.id,
          });
        });

        // will get information of the user's
        let messageDataHolder: any[] = [];
        await Promise.all(
          messagesData.map(async item => {
            const fromUser = await firestore()
              .collection(`${item.from_user_type}s`)
              .doc(item.from)
              .get();

            const toUser = await firestore()
              .collection(`${item.to_user_type}s`)
              .doc(item.to)
              .get();

            messageDataHolder.push({
              ...item,
              fromUser: fromUser.data().name,
              toUser: toUser.data().name,
            });
          }),
        );

        setConversation(messageDataHolder);
      });

    // Stop listening for updates when no longer required
    return () => subscriber();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const renderCard = ({item}: IItem) => {
    const {from, fromUser, toUser, last_message, timestamp} = item;
    const interval = new Date(timestamp.seconds * 1000);

    const name = user.id === from ? toUser : fromUser;

    return (
      <Pressable
        onPress={() =>
          navigation.navigate('Chat', {conversationId: item.id, name: name})
        }>
        <Box flex={1}>
          <HStack flex={1} alignItems="center" p="5" space={3}>
            <Avatar bg="primary.400" alignSelf="center" size="md">
              {name.substring(0, 1).toUpperCase()}
            </Avatar>
            <Box flex={2}>
              <Text bold>{name}</Text>
              <Text numberOfLines={1}>{last_message}</Text>
            </Box>
            <Box flex={1}>
              <Text fontSize="xs">{moment(interval).fromNow()}</Text>
            </Box>
          </HStack>
        </Box>
      </Pressable>
    );
  };
  return (
    <Box flex={1}>
      <AppHeader hasBack title="Messages" navigation={navigation} />
      <FlatList
        contentContainerStyle={conversation.length <= 0 && styles.empty}
        data={conversation}
        renderItem={renderCard}
        ListEmptyComponent={
          <Center>
            <CommentsRegular height={100} width={100} color="#777777" />
            <Text>No messages yet.</Text>
            <Text>Looks like you haven't initiated a conversation</Text>
          </Center>
        }
      />
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

export default Message;
