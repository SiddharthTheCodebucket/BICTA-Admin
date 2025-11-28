import React from 'react';
import { View } from 'react-native';
import TextAtom from '../../../components/atoms/TextAtom';
import { colors } from '../../../constants';

const AllHostel = () => {
  return (
    <View>
      <TextAtom style={{ color: colors.black }}>All Hostel</TextAtom>
    </View>
  );
};

export default AllHostel;
