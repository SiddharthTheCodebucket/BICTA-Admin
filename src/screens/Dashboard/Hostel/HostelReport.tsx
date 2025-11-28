import React from 'react';
import { View } from 'react-native';
import TextAtom from '../../../components/atoms/TextAtom';
import { colors } from '../../../constants';

const HostelReport = () => {
  return (
    <View>
      <TextAtom style={{ color: colors.black }}>Hostel Report Screen</TextAtom>
    </View>
  );
};

export default HostelReport;
