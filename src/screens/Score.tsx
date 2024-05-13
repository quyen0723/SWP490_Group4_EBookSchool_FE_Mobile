import {View, Text, TouchableOpacity, Image, StyleSheet} from 'react-native';
import React, {useEffect} from 'react';
import {StackNavigationProp} from '@react-navigation/stack';
import {RootNavigationProps} from './types';

interface MyProps {
  navigation: StackNavigationProp<RootNavigationProps, 'Score'>;
}
const Score = ({navigation}: MyProps) => {
  useEffect(() => {
    navigation.setOptions({
      title: 'Điểm',
      headerLeft: () => (
        // <Button onPress={() => navigation.goBack()} title="Go Back" />
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Image
            style={styles.imge}
            source={require('../assets/images/icons/Back.png')}
          />
        </TouchableOpacity>
      ),
    });
  }, [navigation]);
  return (
    <View>
      <Text>Score</Text>
    </View>
  );
};

export default Score;
const styles = StyleSheet.create({
  imge: {
    width: 27,
    height: 27,
    tintColor: '#FFFFFF',
    marginLeft: 10,
  },
});
