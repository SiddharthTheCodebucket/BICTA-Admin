import React, { useLayoutEffect } from 'react';
import { StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import moment from 'moment';

import { colors, fonts, vh, vw } from '../../../../../../constants';
import { Header } from '../../../../../../components/organisms/HeaderOrganism';
import TextAtom from '../../../../../../components/atoms/TextAtom';
import ViewAtom from '../../../../../../components/atoms/ViewAtom';

const getStatusBgColor = (status?: string) => {
  switch (status) {
    case 'New':
      return '#FFE7A3';
    case 'In-progress':
      return '#2F6FDB';
    case 'Resolved':
      return '#6FB25D';
    case 'Re-open':
      return '#F39C34';
    case 'Response awaited':
      return '#8E44AD';
    default:
      return '#E0E0E0';
  }
};

const FieldRow = ({ label, value }: any) => (
  <ViewAtom style={styles.row}>
    <TextAtom style={styles.label}>{label}</TextAtom>
    <TextAtom style={styles.value} numberOfLines={0}>
      {value || '-'}
    </TextAtom>
  </ViewAtom>
);

const FullWidthField = ({ label, value }: any) => (
  <ViewAtom style={styles.fullWidthBox}>
    <TextAtom style={styles.fullLabel}>{label}</TextAtom>
    {typeof value === 'string' || typeof value === 'number' ? (
      <TextAtom style={styles.fullValue}>{value || '-'}</TextAtom>
    ) : (
      value
    )}
  </ViewAtom>
);

const MovementHistoryCard = ({ item, index }: any) => (
  <ViewAtom style={styles.movementCard}>
    <FieldRow label="Sr. No" value={index + 1} />
    <FieldRow label="Tracking Id" value={item.trackingId} />
    <FieldRow label="Assigned By" value={item.assignedBy} />
    <FieldRow label="Assigned To" value={item.assignedTo || '-'} />

    <ViewAtom style={styles.row}>
      <TextAtom style={styles.label}>Status</TextAtom>
      <ViewAtom
        style={[
          styles.statusBadge,
          { backgroundColor: getStatusBgColor(item.currentStatus) },
        ]}
      >
        <TextAtom style={styles.statusText}>{item.currentStatus}</TextAtom>
      </ViewAtom>
    </ViewAtom>

    <FullWidthField label="Remark" value={item.reply || '-'} />

    <FieldRow
      label="Assigned Date"
      value={moment(item.createdAt).format('DD-MM-YYYY HH:mm')}
    />
  </ViewAtom>
);

const SupportTicketMovementDetails = ({ route, navigation }: any) => {
  const { movementList = [] } = route.params || {};

  useLayoutEffect(() => {
    Header.setNavigation(navigation, 'Ticket Movement History');
    navigation.BackButtonPress = () => navigation.goBack();
  }, [navigation]);

  return (
    <SafeAreaView edges={['bottom']} style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
      >
        {movementList.length === 0 ? (
          <TextAtom style={styles.noDataText}>
            No movement history found
          </TextAtom>
        ) : (
          movementList.map((item: any, index: number) => (
            <MovementHistoryCard key={item.id} item={item} index={index} />
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default SupportTicketMovementDetails;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundColor,
  },
  scrollContainer: {
    paddingHorizontal: vw(15),
    paddingBottom: vh(40),
  },
  heading: {
    marginTop: vh(15),
    fontFamily: fonts.Roboto_Medium,
    fontSize: vw(16),
    color: colors.black,
  },
  movementCard: {
    backgroundColor: colors.white,
    borderRadius: vw(10),
    padding: vw(15),
    marginTop: vh(12),
    elevation: 4,
    shadowColor: colors.black,
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 1 },
    width: vw(325),
    marginLeft: vh(2),
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: vh(10),
    alignItems: 'center',
  },
  label: {
    fontFamily: fonts.Roboto_Medium,
    fontSize: vw(14),
    color: colors.black,
    flex: 1,
  },
  value: {
    fontFamily: fonts.Roboto_Regular,
    fontSize: vw(14),
    color: colors.grey,
    flex: 1,
    textAlign: 'right',
  },
  statusBadge: {
    paddingHorizontal: vw(14),
    paddingVertical: vh(6),
    borderRadius: vw(20),
  },
  statusText: {
    fontFamily: fonts.Roboto_Medium,
    fontSize: vw(14),
    color: '#000',
  },
  noDataText: {
    marginTop: vh(20),
    textAlign: 'center',
    color: colors.grey,
    fontFamily: fonts.Roboto_Regular,
  },
  fullLabel: {
    fontFamily: fonts.Roboto_Medium,
    fontSize: vw(14),
    color: colors.black,
  },
  fullValue: {
    fontFamily: fonts.Roboto_Regular,
    fontSize: vw(14),
    color: colors.grey,
  },
  fullWidthBox: { marginBottom: vh(10) },
});
