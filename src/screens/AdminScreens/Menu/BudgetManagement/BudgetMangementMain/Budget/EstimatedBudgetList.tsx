import React, { useLayoutEffect, useMemo } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import TextAtom from '../../../../../../components/atoms/TextAtom';
import {
  Header,
  NavigationType,
} from '../../../../../../components/organisms/HeaderOrganism';

import { colors, fonts, strings, vh, vw } from '../../../../../../constants';

const formatINR = (value: number) =>
  `₹ ${Number(value || 0).toLocaleString('en-IN')}`;

interface Props {
  navigation: NavigationType;
  route: any;
}

const BudgetCard = ({ item, index }: any) => {
  return (
    <View style={styles.card}>
      <TextAtom style={[styles.label]}>
        {strings.hostelManagement.hostelAllocationHistory.srNo} {index + 1}
      </TextAtom>
      <View>
        <TextAtom style={styles.label}>Particular</TextAtom>
        <TextAtom numberOfLines={0} style={styles.value}>
          {item.particulars}
        </TextAtom>
      </View>

      <View style={styles.rowBetween}>
        <View style={{ flex: 1 }}>
          <TextAtom style={styles.label}>{'Qty'}</TextAtom>
          <TextAtom numberOfLines={0} style={styles.value}>
            {item.quantityAmount ?? '-'}
          </TextAtom>
        </View>
        <View style={{ flex: 1, alignSelf: 'flex-end' }}>
          <TextAtom style={styles.labelRight}>{'Rate(₹)'}</TextAtom>
          <TextAtom numberOfLines={0} style={styles.valueRight}>
            {item.rate ?? '-'}
          </TextAtom>
        </View>
      </View>
      <View style={styles.rowBetween}>
        <View style={{ flex: 1 }}>
          <TextAtom style={styles.label}>{'Duration'}</TextAtom>
          <TextAtom numberOfLines={0} style={styles.value}>
            {item.trainingDayCount ?? '-'}
          </TextAtom>
        </View>
        <View style={{ flex: 1, alignSelf: 'flex-end' }}>
          <TextAtom style={styles.labelRight}>{'Session'}</TextAtom>
          <TextAtom numberOfLines={0} style={styles.valueRight}>
            {item.session ?? '-'}
          </TextAtom>
        </View>
      </View>
      <View style={styles.rowBetween}>
        <View style={{ flex: 1 }}>
          <TextAtom style={styles.label}>{'Participants'}</TextAtom>
          <TextAtom numberOfLines={0} style={styles.value}>
            {item.trainingDayCount ?? '-'}
          </TextAtom>
        </View>
        <View style={{ flex: 1, alignSelf: 'flex-end' }}>
          <TextAtom style={styles.labelRight}>{'Amount(₹)'}</TextAtom>
          <TextAtom numberOfLines={0} style={styles.amountValue}>
            {formatINR(item.amount) ?? '-'}
          </TextAtom>
        </View>
      </View>
    </View>
  );
};

const BudgetFooter = ({ data }: { data: any[] }) => {
  const grandTotal = useMemo(
    () => data.reduce((sum, item) => sum + (item.amount || 0), 0),
    [data],
  );

  const adminCharge = useMemo(() => grandTotal * 0.125, [grandTotal]);
  const grossTotal = useMemo(
    () => grandTotal + adminCharge,
    [grandTotal, adminCharge],
  );

  return (
    <View style={styles.footerContainer}>
      <View style={styles.footerRow}>
        <TextAtom style={styles.footerLabel}>Grand Total</TextAtom>
        <TextAtom style={styles.footerValue}>{formatINR(grandTotal)}</TextAtom>
      </View>

      <View style={styles.footerRow}>
        <TextAtom style={styles.footerLabel}>
          BIPARD Admin Charges @12.5%
        </TextAtom>
        <TextAtom style={styles.footerValue}>{formatINR(adminCharge)}</TextAtom>
      </View>

      <View style={styles.divider} />

      <View style={styles.footerRow}>
        <TextAtom style={styles.footerLabelBold}>Gross Total</TextAtom>
        <TextAtom style={styles.footerValueBold}>
          {formatINR(grossTotal)}
        </TextAtom>
      </View>
    </View>
  );
};

const EstimatedBudgetList = (props: Props) => {
  const { navigation } = props;
  const budgetDetails = props.route.params?.budgetDetails || [];

  useLayoutEffect(() => {
    Header.setNavigation(navigation, 'Estimated Budget List');
    navigation.BackButtonPress = () => navigation.goBack();
  });

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <FlatList
        data={budgetDetails}
        keyExtractor={item => item.budgetDetailId.toString()}
        renderItem={({ item, index }) => (
          <BudgetCard item={item} index={index} />
        )}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
      <BudgetFooter data={budgetDetails} />
    </SafeAreaView>
  );
};

export default EstimatedBudgetList;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundColor,
  },

  listContainer: {
    paddingVertical: vh(10),
  },

  card: {
    backgroundColor: colors.white,
    marginHorizontal: vw(15),
    borderRadius: vw(8),
    paddingHorizontal: vw(15),
    paddingVertical: vh(8),
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    marginBottom: vh(10),
  },

  particularText: {
    fontFamily: fonts.Roboto_Bold,
    fontSize: vw(15),
    color: colors.black,
    marginBottom: vh(10),
  },

  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: vh(4),
  },

  label: {
    fontFamily: fonts.Roboto_Medium,
    fontSize: vw(14),
    color: colors.black,
  },
  labelRight: {
    fontFamily: fonts.Roboto_Medium,
    fontSize: vw(14),
    color: colors.black,
    textAlign: 'right',
  },
  value: {
    fontFamily: fonts.Roboto_Regular,
    fontSize: vw(14),
    color: colors.grey,
    marginBottom: vh(5),
  },
  valueRight: {
    fontFamily: fonts.Roboto_Regular,
    fontSize: vw(14),
    color: colors.grey,
    marginBottom: vh(5),
    textAlign: 'right',
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  amountBox: {
    marginTop: vh(12),
    paddingTop: vh(10),
    borderTopWidth: 1,
    borderColor: colors.chinese_silver,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  amountLabel: {
    fontFamily: fonts.Roboto_Medium,
    fontSize: vw(14),
    color: colors.black,
  },

  amountValue: {
    fontFamily: fonts.Roboto_Bold,
    fontSize: vw(14),
    color: colors.primary,
    marginBottom: vh(5),
    textAlign: 'right',
  },

  footerContainer: {
    marginTop: vh(10),
    paddingHorizontal: vw(15),
    paddingBottom: vh(15),
  },

  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: vh(2),
  },

  footerLabel: {
    fontFamily: fonts.Roboto_Medium,
    fontSize: vw(12),
    color: colors.black,
  },

  footerValue: {
    fontFamily: fonts.Roboto_Medium,
    fontSize: vw(14),
    color: colors.black,
  },

  footerLabelBold: {
    fontFamily: fonts.Roboto_Bold,
    fontSize: vw(15),
    color: colors.black,
  },

  footerValueBold: {
    fontFamily: fonts.Roboto_Bold,
    fontSize: vw(15),
    color: colors.black,
  },

  divider: {
    height: 1,
    backgroundColor: colors.chinese_silver,
    marginVertical: vh(6),
  },
});
