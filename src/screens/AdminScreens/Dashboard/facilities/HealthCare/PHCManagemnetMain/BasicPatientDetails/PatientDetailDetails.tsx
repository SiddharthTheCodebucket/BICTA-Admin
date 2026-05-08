import React, { useLayoutEffect, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {
  colors,
  fonts,
  vh,
  vw,
} from '../../../../../../../constants';
import { Header } from '../../../../../../../components/organisms/HeaderOrganism';
import TextAtom from '../../../../../../../components/atoms/TextAtom';
import { ActionPopover } from '../../../../../../../components/templates';

const InfoBlock = ({ label, value, danger }: any) => (
  <View style={styles.infoBlock}>
    <TextAtom style={styles.infoLabel}>{label}</TextAtom>
    <TextAtom numberOfLines={0} style={[styles.infoValue, danger && styles.dangerText]}>
      {value ?? '-'}
    </TextAtom>
  </View>
);

const PhotoBlock = ({ label }: { label: string }) => (
  <View style={styles.infoBlock}>
    <TextAtom style={styles.infoLabel}>{label}</TextAtom>
    <View style={styles.photoRow}>
      <View style={styles.photoThumb} />
      <TouchableOpacity activeOpacity={0.85} style={styles.viewButton}>
        <TextAtom style={styles.viewText}>View</TextAtom>
      </TouchableOpacity>
    </View>
  </View>
);

const PatientDetailDetails = ({ route, navigation }: any) => {
  const { data, patientType = 'Trainee' } = route.params || {};
  const [menuOpen, setMenuOpen] = useState(false);

  useLayoutEffect(() => {
    Header.setNavigation(
      navigation,
      'Health Centre',
      undefined,
      undefined,
      undefined,
      {
        backgroundColor: colors.primary_dark_blue,
        titleColor: colors.white,
        backIconColor: colors.white,
      },
      true,
    );
    navigation.BackButtonPress = () => navigation.goBack();
  });

  const uniqueId = data?.uniqueId ?? 'BIP/GAYA/41727/2026';
  const title = data?.name ?? 'Gita Kumari';

  const renderPatientSpecific = () => {
    if (patientType === 'Employee') {
      return (
        <>
          <InfoBlock label="Patient Type" value="Employee" />
          <InfoBlock label="Vendor" value={data?.vendorName ?? 'Vaishnavi Consultancy Services'} />
          <InfoBlock label="Designation" value={data?.designation ?? 'Admin'} />
          <InfoBlock label="Visit Count" value="04" />
        </>
      );
    }

    if (patientType === 'Other') {
      return (
        <>
          <InfoBlock label="Patient Type" value="Other" />
          <InfoBlock label="DOB" value="10-06-1990" />
          <InfoBlock label="Age (Years)" value="35" />
          <InfoBlock label="Gender" value={data?.gender ?? 'Female'} />
        </>
      );
    }

    return (
      <>
        <InfoBlock label="Training Programme" value={data?.trainingName ?? 'Six Days Residential training Programme for Gram Kachahari Sachiv, Panchayati Raj Depart., Govt. of Bihar (486)'} />
        <InfoBlock label="Patient Type" value="Trainee" />
        <InfoBlock label="Batch" value={data?.batchNo ?? '01'} />
        <InfoBlock label="DOB" value="10-06-1990" />
        <InfoBlock label="Age (Years)" value="35" />
        <InfoBlock label="Gender" value={data?.gender ?? 'Female'} />
      </>
    );
  };

  const VisitCard = ({ expanded = false, date = '13-04-2026' }: any) => (
    <View style={styles.visitCard}>
      <View style={styles.visitHeader}>
        <TextAtom style={styles.visitDate}>{date}</TextAtom>
        <TouchableOpacity activeOpacity={0.85} style={styles.smallIcon}>
          <Icon name={expanded ? 'download' : 'dots-vertical'} size={17} color={colors.text_black} />
        </TouchableOpacity>
      </View>
      {expanded && (
        <>
          <TextAtom style={styles.nameLine}>
            {title}{' '}
            <TextAtom style={styles.subtleText}>(Unique ID: {uniqueId})</TextAtom>
          </TextAtom>
          <View style={styles.infoGrid}>
            {renderPatientSpecific()}
            <InfoBlock label="Blood Group" value={data?.bloodGroup ?? 'B+'} />
            <InfoBlock label="Temp (°C)" value={patientType === 'Trainee' ? '40 °F' : '40 °C'} danger />
            <InfoBlock label="BP (mmHg)" value={patientType === 'Trainee' ? '130/90' : '110/70'} danger={patientType === 'Trainee'} />
            <InfoBlock label="Weight (Kg)" value={data?.weight ?? '51'} />
            <InfoBlock label="Doctor" value={data?.assignDoctorName ?? 'Dr. Saurav Kumar'} />
            <InfoBlock label="Treatment Type" value={data?.treatmentTypes ?? 'OPD'} />
            <InfoBlock label="Visit Date" value="13-04-2026" />
            <InfoBlock label="Symptoms" value={data?.primaryObservations ?? 'Acidity, vomiting'} />
            <PhotoBlock label="Live Photo" />
            {patientType !== 'Other' && <PhotoBlock label="Profile Photo" />}
            <InfoBlock label="Created By" value={data?.createdBy ?? 'Vishal Pathak'} />
            <InfoBlock label="Updated By" value={data?.updatedBy ?? 'Vishal Pathak'} />
          </View>
          <TextAtom style={styles.moreText}>View Less</TextAtom>
        </>
      )}
    </View>
  );

  return (
    <SafeAreaView edges={['bottom']} style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContainer}>
        <View style={styles.dateTopRow}>
          <TextAtom style={styles.topDate}>13-04-2026</TextAtom>
          <TouchableOpacity
            activeOpacity={0.85}
            style={styles.smallIcon}
            onPress={() => setMenuOpen(true)}
          >
            <Icon name="dots-vertical" size={17} color={colors.text_black} />
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          activeOpacity={0.85}
          style={styles.backRow}
          onPress={() => navigation.goBack()}
        >
          <Icon name="chevron-left" size={28} color={colors.text_black} />
          <TextAtom style={styles.backTitle}>Basic Patient Details</TextAtom>
          <TextAtom style={styles.countText}>(99877)</TextAtom>
        </TouchableOpacity>
        <View style={styles.segmentRow}>
          {['Trainee', 'Employee', 'Other'].map(tab => (
            <View
              key={tab}
              style={[
                styles.segmentButton,
                patientType === tab && styles.segmentButtonActive,
              ]}
            >
              <TextAtom
                style={[
                  styles.segmentText,
                  patientType === tab && styles.segmentTextActive,
                ]}
              >
                {tab}
              </TextAtom>
            </View>
          ))}
        </View>
        <View style={styles.visitCountCard}>
          <TextAtom style={styles.visitCountTitle}>
            Visit Count <TextAtom style={styles.countText}>(04)</TextAtom>
          </TextAtom>
          <TextAtom style={styles.infoLabel}>Name</TextAtom>
          <TextAtom style={styles.infoValue}>
            {title} <TextAtom style={styles.subtleText}>(Unique ID: {uniqueId})</TextAtom>
          </TextAtom>
        </View>
        <VisitCard expanded date={patientType === 'Trainee' ? '13-04-2026' : '14-04-2026'} />
        <VisitCard date="13-04-2026" />
        <VisitCard date="13-04-2026" />
        <VisitCard date="13-04-2026" />
      </ScrollView>
      <ActionPopover
        visible={menuOpen}
        onClose={() => setMenuOpen(false)}
        items={[
          { label: 'Download', onPress: () => {} },
          { label: 'Edit', onPress: () => {} },
          { label: 'Delete', destructive: true, onPress: () => {} },
        ]}
      />
    </SafeAreaView>
  );
};

export default PatientDetailDetails;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.new_ui_screen_bg,
  },
  scrollContainer: {
    paddingHorizontal: vw(16),
    paddingBottom: vh(40),
  },
  dateTopRow: {
    height: vh(45),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  topDate: {
    fontFamily: fonts.Inter_SemiBold,
    fontSize: vw(16),
    color: colors.text_black,
  },
  smallIcon: {
    width: vw(30),
    height: vw(30),
    borderRadius: vw(8),
    borderWidth: 1,
    borderColor: '#E6E9EF',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
  },
  backRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: vh(8),
  },
  backTitle: {
    fontFamily: fonts.Inter_Medium,
    fontSize: vw(16),
    color: colors.text_black,
  },
  countText: {
    fontFamily: fonts.Inter_Regular,
    color: colors.new_ui_count,
  },
  segmentRow: {
    height: vh(34),
    borderRadius: vw(8),
    backgroundColor: colors.light_sky_blue,
    flexDirection: 'row',
    overflow: 'hidden',
    marginBottom: vh(10),
  },
  segmentButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentButtonActive: {
    backgroundColor: colors.primary_blue,
    borderRadius: vw(8),
  },
  segmentText: {
    fontFamily: fonts.Inter_Medium,
    fontSize: vw(14),
    color: colors.text_black,
  },
  segmentTextActive: {
    color: colors.white,
  },
  visitCountCard: {
    borderRadius: vw(8),
    backgroundColor: colors.light_sky_blue,
    paddingHorizontal: vw(15),
    paddingVertical: vh(14),
    marginBottom: vh(10),
  },
  visitCountTitle: {
    fontFamily: fonts.Inter_SemiBold,
    fontSize: vw(16),
    color: colors.text_black,
    marginBottom: vh(10),
  },
  visitCard: {
    borderRadius: vw(8),
    backgroundColor: colors.white,
    paddingHorizontal: vw(15),
    paddingVertical: vh(16),
    marginBottom: vh(10),
  },
  visitHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: vh(18),
  },
  visitDate: {
    fontFamily: fonts.Inter_SemiBold,
    fontSize: vw(16),
    color: colors.text_black,
  },
  nameLine: {
    fontFamily: fonts.Inter_SemiBold,
    fontSize: vw(14),
    color: colors.text_black,
    marginBottom: vh(12),
  },
  subtleText: {
    fontFamily: fonts.Inter_Regular,
    color: colors.text_grey,
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  infoBlock: {
    width: '50%',
    marginBottom: vh(10),
  },
  infoLabel: {
    fontFamily: fonts.Inter_Regular,
    fontSize: vw(12),
    color: colors.text_light_grey,
    marginBottom: vh(4),
  },
  infoValue: {
    fontFamily: fonts.Inter_Medium,
    fontSize: vw(14),
    color: colors.text_black,
  },
  dangerText: {
    color: colors.red,
  },
  photoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  photoThumb: {
    width: vw(24),
    height: vw(24),
    borderRadius: vw(3),
    backgroundColor: '#D8C0A8',
    marginRight: vw(6),
  },
  viewButton: {
    height: vh(25),
    borderRadius: vw(4),
    backgroundColor: colors.primary_dark_blue,
    paddingHorizontal: vw(8),
    justifyContent: 'center',
  },
  viewText: {
    fontFamily: fonts.Inter_Medium,
    fontSize: vw(12),
    color: colors.white,
  },
  moreText: {
    marginTop: vh(4),
    fontFamily: fonts.Inter_Medium,
    fontSize: vw(14),
    color: '#D48A00',
  },
});
