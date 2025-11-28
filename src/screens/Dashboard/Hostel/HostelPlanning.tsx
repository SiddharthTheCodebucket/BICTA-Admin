import React from 'react';
import { View } from 'react-native';
import TextAtom from '../../../components/atoms/TextAtom';
import { colors } from '../../../constants';

const HostelPlanning = () => {
  return (
    <View>
      <TextAtom style={{ color: colors.black }}>
        Hostel Planning Screen
      </TextAtom>
    </View>
  );
};

export default HostelPlanning;
