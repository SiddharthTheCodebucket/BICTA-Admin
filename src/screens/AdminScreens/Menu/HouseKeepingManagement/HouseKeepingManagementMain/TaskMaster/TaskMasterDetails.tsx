import React, { useLayoutEffect } from 'react';
import { StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, fonts, vh, vw } from '../../../../../../constants';
import { Header } from '../../../../../../components/organisms/HeaderOrganism';
import TextAtom from '../../../../../../components/atoms/TextAtom';
import ViewAtom from '../../../../../../components/atoms/ViewAtom';

const FieldRow = ({ label, value }: any) => (
  <ViewAtom style={styles.row}>
    <TextAtom style={styles.label}>{label}</TextAtom>
    <TextAtom numberOfLines={0} style={styles.value}>
      {value ?? '-'}
    </TextAtom>
  </ViewAtom>
);

const FullWidthField = ({ label, value }: any) => (
  <ViewAtom style={styles.fullWidthBox}>
    <TextAtom style={styles.fullLabel}>{label}</TextAtom>
    <TextAtom numberOfLines={0} style={styles.fullValue}>
      {value ?? '-'}
    </TextAtom>
  </ViewAtom>
);

const TaskMasterDetails = ({ route, navigation }: any) => {
  const { data } = route.params || {};

  useLayoutEffect(() => {
    Header.setNavigation(navigation, 'Task Details');
    navigation.BackButtonPress = () => navigation.goBack();
  }, [navigation]);

  const formatList = (list: any[]) => {
    if (!Array.isArray(list) || list.length === 0) return '-';
    return list.join(', ');
  };

  return (
    <SafeAreaView edges={['bottom']} style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
      >
        <ViewAtom style={styles.card}>
          {/* ONLY REQUIRED FIELDS */}

          <FieldRow label="Location Campus" value={data?.locationCampus} />
          <FieldRow label="Building Type" value={data?.buildingType} />
          <FieldRow label="Building / Area" value={data?.buildingOrArea} />

          <FieldRow label="Task Type" value={data?.taskType} />
          <FullWidthField label="Task Title" value={data?.taskTitle} />

          <FullWidthField
            label="Staff Name"
            value={formatList(data?.staffName)}
          />

          <FullWidthField
            label="Support Admin Name"
            value={formatList(data?.supportAdminName)}
          />

          <FullWidthField label="Description" value={data?.taskDescription} />

          <FullWidthField
            label="Required Skills"
            value={data?.requiredSkills}
          />
        </ViewAtom>
      </ScrollView>
    </SafeAreaView>
  );
};

export default TaskMasterDetails;

/* -------------------- Styles -------------------- */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundColor,
  },

  scrollContainer: {
    paddingBottom: vh(40),
    paddingHorizontal: vw(15),
  },

  card: {
    backgroundColor: colors.white,
    borderRadius: vw(10),
    padding: vw(15),
    marginTop: vh(15),
    elevation: 2,
  },

  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: vh(10),
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

  fullWidthBox: {
    marginBottom: vh(12),
  },

  fullLabel: {
    fontFamily: fonts.Roboto_Medium,
    fontSize: vw(14),
    color: colors.black,
    marginBottom: vh(5),
  },

  fullValue: {
    fontFamily: fonts.Roboto_Regular,
    fontSize: vw(14),
    color: colors.grey,
  },
});
