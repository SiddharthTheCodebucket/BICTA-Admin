import React, { useLayoutEffect, useMemo } from 'react';
import {
  StyleSheet,
  ScrollView,
  Image,
  View,
  TouchableOpacity,
  Pressable,
  ImageBackground,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  colors,
  fonts,
  vh,
  vw,
  strings,
  images,
  SvgDelete,
} from '../../../../../../constants';
import { Header } from '../../../../../../components/organisms/HeaderOrganism';
import TextAtom from '../../../../../../components/atoms/TextAtom';
import ViewAtom from '../../../../../../components/atoms/ViewAtom';
import TouchableAtom from '../../../../../../components/atoms/TouchableAtom';
import ImageAtom from '../../../../../../components/atoms/ImageAtom';
import { globalStyles } from '../../../../../../utils/globalStyles';

type PairProps = {
  label: string;
  value?: string | number | null;
};

const InfoPair = ({ label, value }: PairProps) => (
  <View style={styles.pairBox}>
    <TextAtom style={styles.pairLabel}>{label}</TextAtom>
    <TextAtom numberOfLines={2} style={styles.pairValue}>
      {value !== undefined && value !== null && `${value}`.trim() !== ''
        ? value
        : '-'}
    </TextAtom>
  </View>
);

type ChipProps = {
  label: string;
  active?: boolean;
  onPress?: () => void;
};

const Chip = ({ label, active, onPress }: ChipProps) => (
  <Pressable
    onPress={onPress}
    style={[styles.chip, active ? styles.chipActive : styles.chipInactive]}
  >
    <TextAtom style={[styles.chipText, active && styles.chipTextActive]}>
      {label}
    </TextAtom>
  </Pressable>
);

const SectionToggleRow = ({
  title,
  leftLabel,
  rightLabel,
  activeRight,
  onLeftPress,
  onRightPress,
}: {
  title: string;
  leftLabel: string;
  rightLabel: string;
  activeRight?: boolean;
  onLeftPress?: () => void;
  onRightPress?: () => void;
}) => {
  return (
    <View style={styles.statusBlock}>
      <TextAtom style={styles.sectionTitle}>{title}</TextAtom>
      <View style={globalStyles.switchPillRow}>
        <TouchableAtom
          style={[
            globalStyles.switchPill,
            !activeRight
              ? globalStyles.switchPillActive
              : globalStyles.switchPillInactive,
          ]}
          onPress={() => {}}
        >
          <TextAtom
            style={[
              globalStyles.switchPillText,
              !activeRight
                ? globalStyles.switchPillTextActive
                : globalStyles.switchPillTextInactive,
            ]}
          >
            Active
          </TextAtom>
        </TouchableAtom>

        <TouchableAtom
          style={[
            globalStyles.switchPill,
            !!activeRight
              ? globalStyles.switchPillActive
              : globalStyles.switchPillInactive,
          ]}
          onPress={() => {}}
        >
          <TextAtom
            style={[
              globalStyles.switchPillText,
              !!activeRight
                ? globalStyles.switchPillTextActive
                : globalStyles.switchPillTextInactive,
            ]}
          >
            Inactive
          </TextAtom>
        </TouchableAtom>
      </View>

      {/* <View style={styles.toggleRow}>
        <Chip label={leftLabel} active={!activeRight} onPress={onLeftPress} />
        <Chip
          label={rightLabel}
          active={!!activeRight}
          onPress={onRightPress}
        />
      </View> */}
    </View>
  );
};

const FacultyDetailDetails = ({ route, navigation }: any) => {
  const { data } = route.params || {};

  useLayoutEffect(() => {
    Header.setNavigation(
      navigation,
      strings.lms.facultyManagement.main.title,
      undefined,
      undefined,
      undefined,
      {
        backgroundColor: colors.primary_dark_blue,
        titleColor: colors.white,
        backIconColor: colors.white,
      },
    );
    navigation.BackButtonPress = () => {
      navigation.goBack();
    };
  }, [navigation]);

  const facultyStrings = strings.lms.facultyManagement.details;

  const initials = useMemo(() => {
    const name = `${data?.salutationName || ''} ${
      data?.facultyName || ''
    }`.trim();
    return name?.[0]?.toUpperCase() || 'M';
  }, [data]);

  const displayName = `${data?.salutationName || ''} ${
    data?.facultyName || ''
  }`.trim();

  // const displayName = data.facultyName ?? '-';

  const subjectList = data?.facultySubjects ?? data?.subjects ?? [];

  return (
    <SafeAreaView edges={['bottom']} style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
      >
        <TouchableAtom
          style={styles.titleRow}
          onPress={() => navigation.goBack()}
          activeOpacity={0.8}
        >
          <ImageAtom source={images.arrow_back} style={styles.inlineBackIcon} />
          <TextAtom style={styles.pageTitle}>Faculty Details</TextAtom>
        </TouchableAtom>

        <View style={styles.card}>
          <View
            style={{
              paddingHorizontal: vh(8),
              backgroundColor: colors.backgroundColor,
              borderRadius: vw(8),
            }}
          >
            <View style={styles.profileRow}>
              <View style={styles.avatar}>
                <TextAtom style={styles.avatarText}>{initials}</TextAtom>
              </View>

              <View style={styles.profileTextWrap}>
                <TextAtom numberOfLines={1} style={styles.profileName}>
                  {displayName || '-'}
                </TextAtom>

                <View style={styles.idPill}>
                  <TextAtom style={styles.idPillText}>
                    Faculty ID - {data?.facultyId || '-'}
                  </TextAtom>
                </View>
              </View>
            </View>

            <View style={styles.gridRow}>
              <InfoPair label="Name" value={displayName} />
              <InfoPair label="Faculty U.I.D" value={data?.facultyUniqueId} />
            </View>

            <View style={styles.gridRow}>
              <InfoPair label="Faculty Type" value={data?.facultyType} />
              <InfoPair
                label="Faculty Organisation"
                value={data?.facultyOrganisation}
              />
            </View>

            <View style={styles.gridRow}>
              <InfoPair label="Designation" value={data?.designation} />
              <InfoPair label="Department" value={data?.department} />
            </View>

            <View style={styles.gridRow}>
              <InfoPair label="Location" value={data?.state} />
              <InfoPair label="Mobile No." value={data?.mobileNo} />
            </View>

            <View style={styles.gridRow}>
              <InfoPair label="Email ID" value={data?.emailId} />
              <InfoPair label="BIPARD Pay Level" value={data?.payLevel} />
            </View>

            <View style={styles.gridRow}>
              <InfoPair label="Created By" value={data?.createdBy?.name} />
              <InfoPair label="Remuneration" value={data?.remuneration} />
            </View>

            <View style={styles.gridRow}>
              <InfoPair label="" value="" />
              <InfoPair label="Updated By" value={data?.updatedBy?.name} />
            </View>
          </View>
        </View>

        <View style={styles.subjectCard}>
          <View style={styles.sectionHeaderRow}>
            <TextAtom style={styles.sectionHeader}>Faculty Subject</TextAtom>

            <TouchableAtom
              style={{
                paddingHorizontal: vw(6),
                paddingVertical: vh(5),
                alignItems: 'center',
                justifyContent: 'center',
              }}
              onPress={() => {}}
            >
              <ImageBackground
                source={images.buttonGrad_25}
                style={{
                  paddingHorizontal: vw(6),
                  paddingVertical: vh(5),
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                imageStyle={globalStyles.createButtonImage}
                resizeMode="stretch"
              >
                <TextAtom
                  style={{
                    fontFamily: fonts.Inter_Medium,
                    fontSize: vw(12),
                    color: colors.white,
                  }}
                >
                  + Create
                </TextAtom>
              </ImageBackground>
            </TouchableAtom>
          </View>

          {(subjectList || []).map((item: any, index: number) => (
            <View key={`${item?.id ?? index}`} style={styles.subjectItem}>
              <View style={styles.subjectTextWrap}>
                <TextAtom numberOfLines={1} style={styles.subjectTitle}>
                  {item?.subjectName || item?.name || '-'}
                </TextAtom>
                <TextAtom numberOfLines={1} style={styles.subjectSubTitle}>
                  <TextAtom style={styles.subjectSubLabel}>Topic - </TextAtom>
                  <TextAtom style={styles.subjectSubValue}>
                    {item?.topic ||
                      item?.subjectTopic ||
                      item?.description ||
                      '-'}
                  </TextAtom>
                </TextAtom>
              </View>

              <TouchableOpacity
                style={styles.deleteIconBtn}
                onPress={() => {
                  // put delete action here
                }}
                activeOpacity={0.8}
              >
                <SvgDelete />
              </TouchableOpacity>
            </View>
          ))}
        </View>

        <View style={styles.statusCard}>
          <SectionToggleRow
            title="Status"
            leftLabel="Active"
            rightLabel="Inactive"
            activeRight={
              String(data?.status || '').toLowerCase() === 'inactive'
            }
          />

          <SectionToggleRow
            title="Is Approved"
            leftLabel="Pending"
            rightLabel="Approved"
            activeRight={
              String(data?.isApproved || '').toLowerCase() === 'approved'
            }
          />

          <SectionToggleRow
            title="Block / Unblock Certificate"
            leftLabel="Block"
            rightLabel="Unblock"
            activeRight={!!data?.isBlacklisted}
          />
        </View>
      </ScrollView>

      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.deleteBtn}
          onPress={() => {
            // delete action
          }}
          activeOpacity={0.8}
        >
          <TextAtom style={styles.deleteBtnText}>Delete</TextAtom>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.editBtn}
          onPress={() => {
            navigation.navigate('AddFacultyDetails', { item: data });
          }}
          activeOpacity={0.8}
        >
          <ImageBackground
            source={images.buttonGrad_50}
            style={{
              flex: 1,
              paddingHorizontal: vw(6),
              paddingVertical: vh(5),
              alignItems: 'center',
              justifyContent: 'center',
            }}
            imageStyle={globalStyles.createButtonImage}
            resizeMode="stretch"
          >
            <TextAtom style={styles.editBtnText}>Edit</TextAtom>
          </ImageBackground>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default FacultyDetailDetails;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundColor,
  },

  scrollContainer: {
    paddingHorizontal: vw(12),
    paddingBottom: vh(110),
  },

  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: vh(10),
    marginBottom: vh(10),
  },

  inlineBackIcon: {
    width: vw(18),
    height: vw(18),
    tintColor: colors.new_ui_heading,
    marginRight: vw(8),
  },

  pageTitle: {
    fontFamily: fonts.Inter_SemiBold,
    fontSize: 16,
    color: colors.text_black,
  },

  card: {
    backgroundColor: colors.white,
    borderRadius: vw(12),
    padding: vw(12),
    marginTop: vh(4),
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },

  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: vh(12),
  },

  avatar: {
    width: vw(34),
    height: vw(34),
    borderRadius: vw(17),
    backgroundColor: '#E9F1FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: vw(10),
  },

  avatarText: {
    fontFamily: fonts.Inter_SemiBold,
    fontSize: 16,
    color: colors.primary_dark_blue,
  },

  profileTextWrap: {
    flex: 1,
  },

  profileName: {
    fontFamily: fonts.Inter_SemiBold,
    fontSize: 16,
    color: colors.text_black,
    marginBottom: vh(4),
  },

  idPill: {
    alignSelf: 'flex-start',
    backgroundColor: '#EEF4FF',
    borderRadius: vw(6),
    paddingHorizontal: vw(8),
    paddingVertical: vh(3),
  },

  idPillText: {
    fontFamily: fonts.Inter_Medium,
    fontSize: 11,
    color: colors.new_ui_heading,
  },

  gridRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },

  pairBox: {
    flex: 1,
    marginBottom: vh(10),
    paddingRight: vw(8),
  },

  pairLabel: {
    fontFamily: fonts.Inter_Regular,
    fontSize: 13,
    color: colors.new_ui_count,
    marginBottom: vh(3),
  },

  pairValue: {
    fontFamily: fonts.Inter_SemiBold,
    fontSize: 15,
    color: colors.text_black,
    lineHeight: 20,
  },

  subjectCard: {
    marginTop: vh(12),
    backgroundColor: colors.white,
    borderRadius: vw(14),
    padding: vw(12),
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },

  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: vh(10),
  },

  sectionHeader: {
    fontFamily: fonts.Inter_SemiBold,
    fontSize: 16,
    color: colors.new_ui_heading,
  },

  createBtn: {
    backgroundColor: colors.primary_dark_blue,
    borderRadius: vw(6),
    paddingHorizontal: vw(10),
    paddingVertical: vh(5),
  },

  createBtnText: {
    fontFamily: fonts.Inter_SemiBold,
    fontSize: 13,
    color: colors.white,
  },

  subjectItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FAFAFC',
    borderRadius: vw(10),
    paddingHorizontal: vw(12),
    paddingVertical: vh(10),
    marginBottom: vh(10),
    borderWidth: 1,
    borderColor: '#F0F0F3',
  },

  subjectTextWrap: {
    flex: 1,
    paddingRight: vw(10),
  },

  subjectTitle: {
    fontFamily: fonts.Inter_Medium,
    fontSize: 15,
    color: colors.text_black,
    marginBottom: vh(4),
  },

  subjectSubTitle: {
    fontSize: 12,
  },

  subjectSubLabel: {
    fontFamily: fonts.Inter_Regular,
    fontSize: 12,
    color: colors.new_ui_heading,
  },

  subjectSubValue: {
    fontFamily: fonts.Inter_Regular,
    fontSize: 12,
    color: colors.new_ui_count,
  },

  deleteIconBtn: {
    width: vw(32),
    height: vw(32),
    borderRadius: vw(8),
    borderWidth: 1,
    borderColor: '#E6E6EE',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
  },

  deleteIcon: {
    fontSize: 14,
  },

  statusCard: {
    marginTop: vh(12),
    backgroundColor: colors.white,
    borderRadius: vw(12),
    padding: vw(8),
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },

  statusBlock: {
    backgroundColor: '#FAFAFC',
    borderRadius: vw(10),
    padding: vw(10),
    marginBottom: vh(10),
  },

  sectionTitle: {
    fontFamily: fonts.Inter_Regular,
    fontSize: 14,
    color: colors.new_ui_count,
    marginBottom: vh(8),
  },

  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  chip: {
    borderRadius: vw(4),
    paddingHorizontal: vw(10),
    paddingVertical: vh(4),
    marginRight: vw(6),
  },

  chipInactive: {
    backgroundColor: '#EEF4FF',
  },

  chipActive: {
    backgroundColor: colors.primary_dark_blue,
  },

  chipText: {
    fontFamily: fonts.Inter_Medium,
    fontSize: 12,
    color: colors.text_black,
  },

  chipTextActive: {
    color: colors.white,
  },

  bottomBar: {
    position: 'absolute',
    left: vw(12),
    right: vw(12),
    bottom: vh(10),
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  deleteBtn: {
    flex: 1,
    height: vh(42),
    borderRadius: vw(8),
    borderWidth: 1,
    borderColor: colors.primary_dark_blue,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: vw(8),
  },

  deleteBtnText: {
    fontFamily: fonts.Inter_SemiBold,
    fontSize: 15,
    color: colors.text_black,
  },

  editBtn: {
    flex: 1,
    height: vh(42),
    borderRadius: vw(8),
    backgroundColor: colors.primary_dark_blue,

    marginLeft: vw(8),

    overflow: 'hidden',
  },

  editBtnText: {
    fontFamily: fonts.Inter_SemiBold,
    fontSize: 15,
    color: colors.white,
  },
});
