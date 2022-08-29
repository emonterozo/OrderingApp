import React, {useContext, useRef, useState} from 'react';
import {
  AspectRatio,
  Box,
  Heading,
  Image,
  Stack,
  Text,
  Button,
  Actionsheet,
  IconButton,
  Icon,
  HStack,
  Divider,
  VStack,
} from 'native-base';

import {AppHeader} from '../../../components';

import Carousel from 'react-native-snap-carousel';
import {Dimensions} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import GlobalContext from '../../../config/context';
import {isEqual} from 'lodash';
import {USER_BUYER, USER_SELLER} from '../../../utils/constant';

export const SLIDER_WIDTH = Dimensions.get('window').width + 30;
export const ITEM_WIDTH = Math.round(SLIDER_WIDTH * 0.8);

interface IItem {
  item: string;
}

const ProductDetails = ({navigation, route}: any) => {
  const {userType, cart, setCart} = useContext(GlobalContext);
  const {product} = route.params;
  const isCarousel = useRef(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [quantity, setQuantity] = useState(1);

  const renderItem = ({item}: IItem) => {
    return (
      <Box>
        <AspectRatio w="100%">
          <Image
            source={{
              uri: item,
            }}
            alt="images"
          />
        </AspectRatio>
      </Box>
    );
  };

  const handlePressAdd = () => {
    let holder = cart;
    const productExist = cart.filter(item => item.id === product.id);

    if (productExist.length) {
      let updatedCart = cart.map(item => {
        if (item.id === product.id) {
          return {
            ...item,
            quantity: item.quantity + quantity,
          };
        } else {
          return item;
        }
      });
      holder = updatedCart;
    } else {
      holder.push({
        ...product,
        quantity: quantity,
      });
    }
    setCart(holder);
    setQuantity(1);
    setIsSheetOpen(false);
  };

  return (
    <Box flex={1}>
      <AppHeader
        isCartVisible={isEqual(userType, USER_BUYER)}
        hasBack
        title="Product Details"
        navigation={navigation}
      />
      <Box my="2" alignItems="center">
        <Carousel
          ref={isCarousel}
          data={product?.images}
          renderItem={renderItem}
          sliderWidth={SLIDER_WIDTH}
          itemWidth={ITEM_WIDTH}
        />
      </Box>
      <Box flex={1}>
        <Stack p="3" space={3}>
          <Stack space={2}>
            <Heading size="md" ml="-1">
              {product.name}
            </Heading>
          </Stack>
          <Text fontWeight="400">{product.description}</Text>
          <Text color="coolGray.600" fontWeight="bold">
            {`PHP ${product.price}`}
          </Text>
        </Stack>
      </Box>
      <VStack m={5} space={2}>
        {isEqual(userType, USER_SELLER) ? (
          <Button
            borderRadius="full"
            onPress={() =>
              navigation.navigate('ProductForm', {
                title: 'Edit Product',
                product: product,
              })
            }>
            Edit
          </Button>
        ) : (
          <Button borderRadius="full" onPress={() => setIsSheetOpen(true)}>
            Add to Cart
          </Button>
        )}
      </VStack>
      <Actionsheet isOpen={isSheetOpen} onClose={() => setIsSheetOpen(false)}>
        <Actionsheet.Content>
          <HStack w="100%" space="3">
            <AspectRatio w="50%">
              <Image
                source={{
                  uri: product?.images[0],
                }}
                alt="images"
              />
            </AspectRatio>
            <Box flex={1}>
              <Stack p="3" space={3}>
                <Stack space={2}>
                  <Heading size="md" ml="-1">
                    {product.name}
                  </Heading>
                </Stack>
                <Text numberOfLines={3} fontWeight="400">
                  {product.description}
                </Text>
                <Text color="coolGray.600" fontWeight="bold">
                  {`PHP ${product.price}`}
                </Text>
              </Stack>
            </Box>
          </HStack>
          <Divider my="3" />
          <HStack
            w="100%"
            p={4}
            alignItems="center"
            justifyContent="space-between">
            <Text fontSize="16">Quantity</Text>
            <HStack space={2} alignItems="center">
              <IconButton
                size="xs"
                bg="warmGray.300"
                icon={
                  <Icon as={MaterialCommunityIcons} name="minus" size="sm" />
                }
                disabled={quantity <= 1}
                onPress={() => setQuantity(quantity - 1)}
              />
              <Text>{quantity}</Text>
              <IconButton
                size="xs"
                bg="warmGray.300"
                icon={
                  <Icon as={MaterialCommunityIcons} name="plus" size="sm" />
                }
                onPress={() => setQuantity(quantity + 1)}
              />
            </HStack>
          </HStack>
          <Button w="full" onPress={() => handlePressAdd()}>
            Add
          </Button>
        </Actionsheet.Content>
      </Actionsheet>
    </Box>
  );
};

export default ProductDetails;
