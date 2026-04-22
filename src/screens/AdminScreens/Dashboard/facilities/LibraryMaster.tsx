import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../../../../constants';

const LibraryMaster = () => (
  <View style={styles.container}>
    <Text>Library Master</Text>
  </View>
);
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.new_ui_screen_bg,
  },
});
export default LibraryMaster;
