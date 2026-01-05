import React, { useLayoutEffect } from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, fonts, vw, vh } from '../../../../../constants';
import {
  Header,
  NavigationType,
} from '../../../../../components/organisms/HeaderOrganism';
import TextAtom from '../../../../../components/atoms/TextAtom';

interface Props {
  route: any;
  navigation: NavigationType;
}
interface TourItem {
  trainingName?: string;
  vehicleName?: string;
  vehicleRegistrationNo?: string;
  driverName?: string;
  driverNumber?: string;
  routeType?: string;
  startPoint?: string;
  endPoint?: string;
  startDate?: string;
  startTime?: string;
  endDate?: string;
  endTime?: string;
  isTripCompleted?: string;
  createdBy?: string;
  updatedBy?: string;
}

interface TourCardProps {
  item: TourItem;
}

const TourCard = ({ item }: TourCardProps) => {
  return (
    <View style={styles.card}>
      <TextAtom style={styles.label}>Training Name</TextAtom>
      <TextAtom numberOfLines={0} style={styles.value}>
        {item.trainingName ?? '-'}
      </TextAtom>

      <View style={styles.rowBetween}>
        <View style={{ flex: 1 }}>
          <TextAtom style={styles.label}>Vehicle Name</TextAtom>
          <TextAtom style={styles.value}>{item.vehicleName ?? '-'}</TextAtom>
        </View>

        <View style={{ flex: 1, alignItems: 'flex-end' }}>
          <TextAtom style={styles.labelRight}>Registration No</TextAtom>
          <TextAtom style={styles.valueRight}>
            {item.vehicleRegistrationNo ?? '-'}
          </TextAtom>
        </View>
      </View>

      <View style={[styles.rowBetween, { marginTop: vh(10) }]}>
        <View style={{ flex: 1 }}>
          <TextAtom style={styles.label}>Driver Name</TextAtom>
          <TextAtom style={styles.value}>{item.driverName ?? '-'}</TextAtom>
        </View>

        <View style={{ flex: 1, alignItems: 'flex-end' }}>
          <TextAtom style={styles.labelRight}>Driver Number</TextAtom>
          <TextAtom style={styles.valueRight}>
            {item.driverNumber ?? '-'}
          </TextAtom>
        </View>
      </View>

      <TextAtom style={styles.label}>Route Type</TextAtom>
      <TextAtom style={styles.value}>{item.routeType ?? '-'}</TextAtom>

      <TextAtom style={styles.label}>Start Point</TextAtom>
      <TextAtom numberOfLines={0} style={styles.value}>
        {item.startPoint ?? '-'}
      </TextAtom>

      <TextAtom style={styles.label}>End Point</TextAtom>
      <TextAtom numberOfLines={0} style={styles.value}>
        {item.endPoint ?? '-'}
      </TextAtom>

      <View style={[styles.rowBetween, { marginTop: vh(10) }]}>
        <View style={{ flex: 1 }}>
          <TextAtom style={styles.label}>Start Date Time</TextAtom>
          <TextAtom style={styles.value}>
            {`${item.startDate ?? '-'} ${item.startTime ?? '-'}`}
          </TextAtom>
        </View>

        <View style={{ flex: 1, alignItems: 'flex-end' }}>
          <TextAtom style={styles.labelRight}>End Date Time</TextAtom>
          <TextAtom style={styles.valueRight}>
            {`${item.endDate ?? '-'} ${item.endTime ?? '-'}`}
          </TextAtom>
        </View>
      </View>

      <TextAtom style={styles.label}>Is Trip Completed</TextAtom>
      <TextAtom style={styles.value}>{item.isTripCompleted ?? '-'}</TextAtom>

      <TextAtom style={styles.label}>Created By</TextAtom>
      <TextAtom style={styles.value}>{item.createdBy ?? '-'}</TextAtom>

      <TextAtom style={styles.label}>Updated By</TextAtom>
      <TextAtom style={styles.value}>{item.updatedBy ?? '-'}</TextAtom>
    </View>
  );
};

const CreateTourDetails = (props: Props) => {
  const { navigation } = props;
  const item = props.route.params?.item;

  useLayoutEffect(() => {
    Header.setNavigation(navigation, 'Create Tour Details');
    navigation.BackButtonPress = () => navigation.goBack();
  });

  return (
    <SafeAreaView edges={['bottom']} style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <TourCard item={item} />
      </ScrollView>
    </SafeAreaView>
  );
};

export default CreateTourDetails;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundColor,
  },

  card: {
    backgroundColor: colors.white,
    marginHorizontal: vw(15),
    marginTop: vh(20),
    borderRadius: vw(8),
    paddingHorizontal: vw(15),
    paddingVertical: vh(12),
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
  },

  label: {
    fontFamily: fonts.Roboto_Medium,
    fontSize: vw(14),
    color: colors.black,
  },
  value: {
    fontFamily: fonts.Roboto_Regular,
    fontSize: vw(14),
    color: colors.grey,
    marginBottom: vh(8),
  },

  labelRight: {
    fontFamily: fonts.Roboto_Medium,
    fontSize: vw(14),
    color: colors.black,
    textAlign: 'right',
  },
  valueRight: {
    fontFamily: fonts.Roboto_Regular,
    fontSize: vw(14),
    color: colors.grey,
    marginBottom: vh(8),
    textAlign: 'right',
  },

  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  editBtn: {
    borderWidth: vw(1),
    borderColor: colors.green,
    borderRadius: vw(6),
    padding: vw(3),
  },
  deleteBtn: {
    borderWidth: vw(1),
    borderColor: colors.red_2,
    borderRadius: vw(6),
    padding: vw(3),
  },
  editIcon: {
    tintColor: colors.green,
    width: vw(15),
    height: vw(15),
  },
  deleteIcon: {
    width: vw(15),
    height: vw(15),
  },
});
