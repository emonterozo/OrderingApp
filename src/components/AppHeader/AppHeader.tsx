import React, {useContext} from 'react';
import {HStack, IconButton, Icon, Text} from 'native-base';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import GlobalContext from '../../config/context';
import {removeUser} from '../../utils/utils';

interface IAppBar {
  hasBack?: boolean;
  title?: string;
  navigation?: any;
  isLogoutVisible?: boolean;
  right?: any;
}

const AppHeader = ({
  hasBack,
  title,
  navigation,
  isLogoutVisible,
  right,
}: IAppBar) => {
  const {setUserType, setUser} = useContext(GlobalContext);
  return (
    <HStack
      bg="primary.600"
      p={2}
      justifyContent="space-between"
      alignItems="center"
      w="100%">
      <HStack alignItems="center">
        {hasBack && (
          <IconButton
            icon={
              <Icon
                as={MaterialCommunityIcons}
                name="arrow-left"
                size="lg"
                color="white"
              />
            }
            onPress={() => navigation.goBack()}
          />
        )}
        <Text marginLeft={2} color="white" fontSize="20" fontWeight="bold">
          {title}
        </Text>
      </HStack>
      {isLogoutVisible && (
        <IconButton
          icon={
            <Icon color="white" as={MaterialCommunityIcons} name="logout" />
          }
          size="lg"
          onPress={() => {
            setUser(null);
            setUserType('');
            removeUser();
          }}
        />
      )}
      {right}
    </HStack>
  );
};

export default AppHeader;
