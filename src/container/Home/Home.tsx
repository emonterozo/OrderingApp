import React, {useContext} from 'react';
import {Box, Button, VStack} from 'native-base';

import GlobalContext from '../../config/context';
import {USER_BUYER, USER_SELLER} from '../../utils/constant';

const Home = () => {
  const {setUserType} = useContext(GlobalContext);

  return (
    <Box flex={1} safeArea>
      <VStack flex={1} justifyContent="center" space={5} mx={5}>
        <Button
          borderRadius="full"
          size="lg"
          onPress={() => setUserType(USER_SELLER)}>
          Seller
        </Button>
        <Button
          borderRadius="full"
          size="lg"
          onPress={() => setUserType(USER_BUYER)}>
          Buyer
        </Button>
      </VStack>
    </Box>
  );
};

export default Home;
