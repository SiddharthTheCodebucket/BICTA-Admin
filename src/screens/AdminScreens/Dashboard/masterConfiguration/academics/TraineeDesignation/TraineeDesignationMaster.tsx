import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../../../../../../constants';

const TraineeDesignationMaster = () => (
  <View style={styles.container}><Text>Trainee Designation</Text></View>
);
const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.new_ui_screen_bg },
});
export default TraineeDesignationMaster;
