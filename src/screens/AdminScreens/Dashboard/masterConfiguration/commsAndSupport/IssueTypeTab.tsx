import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, fonts, vw } from '../../../../../constants';

const IssueTypeTab = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Issue Type List</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.new_ui_screen_bg,
  },
  text: {
    fontFamily: fonts.Inter_Medium,
    fontSize: vw(16),
    color: colors.text_black,
  },
});

export default IssueTypeTab;
