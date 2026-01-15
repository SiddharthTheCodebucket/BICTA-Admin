import { StyleSheet, TouchableOpacity, View } from 'react-native';
import React, { useLayoutEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, screensName, strings, vh, vw } from '../../../../../constants';
import {
  Header,
  NavigationType,
} from '../../../../../components/organisms/HeaderOrganism';
import TextAtom from '../../../../../components/atoms/TextAtom';

interface Props {
  navigation: NavigationType;
}

const Pharmacy = (props: Props) => {
  const { navigation } = props;

  useLayoutEffect(() => {
    Header.setNavigation(navigation, strings.pharmacy);
    navigation.BackButtonPress = () => {
      navigation.goBack();
    };
  }, []);

  const DATA = [
    {
      id: 1,
      name: 'Priscribed Medicine to Patinets',
      onPress: () => {
        navigation.navigate(screensName.Patients);
      },
    },
    {
      id: 3,
      name: strings.medicine_type,
      onPress: () => {
        navigation.navigate(screensName.MedicineType);
      },
    },
    {
      id: 2,
      name: strings.pharmacy_master,
      onPress: () => {
        navigation.navigate(screensName.PharmacyMaster);
      },
    },
    {
      id: 4,
      name: strings.update_stock,
      onPress: () => {
        navigation.navigate(screensName.UpdateStock);
      },
    },
    {
      id: 5,
      name: strings.stock_report,
      onPress: () => {
        navigation.navigate(screensName.StockReport);
      },
    },
  ];

  return (
    <SafeAreaView edges={['bottom']} style={styles.container}>
      <View style={{ flex: 1 }}>
        {DATA.map(item => {
          return (
            <TouchableOpacity
              key={item.id.toString()}
              style={styles.touchable}
              onPress={item.onPress}
            >
              <TextAtom>{item.name}</TextAtom>
            </TouchableOpacity>
          );
        })}
      </View>
    </SafeAreaView>
  );
};

export default Pharmacy;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundColor,
  },
  logoutBtn: {
    alignSelf: 'center',
    width: '90%',
  },
  touchable: {
    width: vw(328),
    height: vh(55),
    borderRadius: vw(6),
    backgroundColor: colors.primary,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: vh(15),
  },
  hardcodedStyle: {
    opacity: 0.8,
    transform: [{ scale: 1.1 }],
  },
});
