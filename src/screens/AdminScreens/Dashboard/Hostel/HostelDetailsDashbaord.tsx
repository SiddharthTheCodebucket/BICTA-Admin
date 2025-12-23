import React, { useEffect, useLayoutEffect, useState } from 'react';
import { StyleSheet, View, FlatList, Modal, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, fonts, vw, vh } from '../../../../constants';
import strings from '../../../../constants/strings';
import TextAtom from '../../../../components/atoms/TextAtom';
import {
  useHostelBedDetailsDataMutation,
  useHostelRoomDetailsDataMutation,
} from '../../../../injectEndpoints/dashboardEndpoints';
import Toast from 'react-native-toast-message';
import FullscreenLoading from '../../../../components/organisms/FullscreenLoading';
import TouchableAtom from '../../../../components/atoms/TouchableAtom';
import ViewAtom from '../../../../components/atoms/ViewAtom';
import { Header } from '../../../../components/organisms/HeaderOrganism';

interface FloorCardProps {
  floor: any;
  getRoomColor: (vacant: number, total: number) => string;
  onRoomPress: (room: any, isVacant: boolean) => void;
}

const FloorCard = ({ floor, getRoomColor, onRoomPress }: FloorCardProps) => {
  return (
    <View style={styles.floorCard}>
      <TextAtom style={styles.floorTitle}>{floor.floorName}</TextAtom>
      <ViewAtom style={styles.line} />

      <View style={styles.roomsContainer}>
        {floor.rooms.map((room: any) => {
          const isVacant = room.vacantBeds === room.totalBeds;

          return (
            <TouchableAtom
              key={room.roomId}
              style={[
                styles.roomBox,
                {
                  backgroundColor: getRoomColor(
                    room.vacantBeds,
                    room.totalBeds,
                  ),
                },
              ]}
              onPress={() => onRoomPress(room, isVacant)}
            >
              <TextAtom style={styles.roomText}>{room.roomNo}</TextAtom>
            </TouchableAtom>
          );
        })}
      </View>
    </View>
  );
};

interface BedDetailsModalProps {
  visible: boolean;
  bedReportData: any[];
  onClose: () => void;
}

const BedDetailsModal = ({
  visible,
  bedReportData,
  onClose,
}: BedDetailsModalProps) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalBox}>
          <TouchableAtom style={styles.closeBtn} onPress={onClose}>
            <TextAtom style={styles.closeButtonText}>
              {strings.hostelDetailsDashboard.closeSymbol}
            </TextAtom>
          </TouchableAtom>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.modalScrollContent}
          >
            {bedReportData.map((bed: any, index: number) => {
              const detail = bed.allocatedDetails[0];

              return (
                <View key={bed.bedId ?? index} style={styles.bedCard}>
                  <View style={styles.rowBetween}>
                    <View style={styles.tag}>
                      <TextAtom style={styles.tagText}>
                        {strings.hostelDetailsDashboard.floorName}
                      </TextAtom>
                      <TextAtom style={styles.tagText}>
                        {bed.floorNumber}
                      </TextAtom>
                    </View>

                    <View style={styles.tag}>
                      <TextAtom style={styles.tagText}>
                        {strings.hostelDetailsDashboard.roomNumber}
                      </TextAtom>
                      <TextAtom style={styles.tagText}>{bed.roomNo}</TextAtom>
                    </View>
                  </View>

                  <View style={styles.bedTag}>
                    <TextAtom style={styles.bedTagText}>
                      {strings.hostelDetailsDashboard.bedNumber} {bed.bedNumber}
                    </TextAtom>
                  </View>

                  <View style={styles.rowBetween}>
                    <TextAtom style={styles.nameText}>
                      {detail?.name} ({detail?.gender})
                    </TextAtom>
                    <TextAtom style={styles.mobileText}>
                      +91 {detail?.mobileNo}
                    </TextAtom>
                  </View>

                  <View style={styles.rowBetween}>
                    <TextAtom style={styles.dateText}>
                      {strings.hostelDetailsDashboard.from}{' '}
                      {detail?.trainingStartDate}
                    </TextAtom>
                    <TextAtom style={styles.dateText}>
                      {strings.hostelDetailsDashboard.to}{' '}
                      {detail?.trainingEndDate}
                    </TextAtom>
                  </View>

                  <TextAtom style={styles.trainingText}>
                    {strings.hostelDetailsDashboard.training}{' '}
                    {detail?.trainingName}
                  </TextAtom>

                  {index !== bedReportData.length - 1 && (
                    <View style={styles.divider} />
                  )}
                </View>
              );
            })}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const HostelDetailsDashbaord = (props: any) => {
  const item = props.route?.params?.item;
  const { navigation } = props;
  const selectedCenter = props.route?.params?.selectedCenter;

  const [loader, setLoader] = useState(false);
  const [reportData, setReportData] = useState<any>([]);
  const [bedReportData, setBedReportData] = useState<any>([]);
  const [modalVisible, setModalVisible] = useState(false);

  const [hostelRoomDataApi] = useHostelRoomDetailsDataMutation();
  const [hostelBedDataApi] = useHostelBedDetailsDataMutation();

  useLayoutEffect(() => {
    Header.setNavigation(navigation, item?.hostelName);
    navigation.BackButtonPress = () => navigation.goBack();
  }, []);

  useEffect(() => {
    fetchHostelData();
  }, [selectedCenter]);

  const [summary, setSummary] = useState({
    totalFloorCount: 0,
    totalRoomCount: 0,
    totalBeds: 0,
    totalVacantBeds: 0,
    totalOccupiedBeds: 0,
  });

  const fetchHostelData = () => {
    setLoader(true);

    let params: any = {
      hostelId: item.id,
      roomStatus: 'all',
    };

    if (selectedCenter) {
      params.bipardCentre =
        selectedCenter === 'All Centers' ? ['Gaya', 'Patna'] : [selectedCenter];
    }

    hostelRoomDataApi(params)
      .unwrap()
      .then((res: any) => {
        const list = res?.data || [];

        setReportData(list);

        setSummary({
          totalFloorCount: list.hostelDetails[0].totalFloors,
          totalRoomCount: list.hostelDetails[0].totalRooms,
          totalBeds: list.hostelDetails[0].totalBeds,
          totalVacantBeds: list.hostelDetails[0].totalVacantBeds,
          totalOccupiedBeds:
            list.hostelDetails[0].totalBeds -
            list.hostelDetails[0].totalVacantBeds,
        });

        setLoader(false);
      })
      .catch(() => {
        setLoader(false);
        Toast.show({ type: 'error', text2: strings.something_went_wrong });
      });
  };

  const fetchBedData = (roomId: any) => {
    setLoader(true);

    let params: any = {
      hostelId: item.id,
      roomId: roomId,
    };

    hostelBedDataApi(params)
      .unwrap()
      .then((res: any) => {
        const allocatedBeds = res?.data?.bedDetails?.filter(
          (b: any) => b.isAllocated === 'Yes',
        );

        setBedReportData(allocatedBeds || []);
        setModalVisible(true);

        setLoader(false);
      })
      .catch(() => {
        setLoader(false);
        Toast.show({ type: 'error', text2: strings.something_went_wrong });
      });
  };

  const getRoomColor = (vacantBeds: any, totalBeds: any) => {
    if (vacantBeds === totalBeds) return colors.successGreen;
    if (vacantBeds === 0) return colors.errorRed;
    return colors.warningOrange;
  };

  const renderTotalCard = () => {
    return (
      <View style={[styles.card, styles.summaryCardBg]}>
        <View style={[styles.rowBetween, { alignItems: 'flex-start' }]}>
          <View style={styles.flex1}>
            <TextAtom style={styles.label}>
              {strings.hostelDetailsDashboard.noOfFloors}
            </TextAtom>
            <TextAtom style={styles.value}>{summary.totalFloorCount}</TextAtom>
          </View>

          <View style={[styles.flex1, styles.alignCenter]}>
            <TextAtom style={styles.label}>
              {strings.hostelDetailsDashboard.noOfRooms}
            </TextAtom>
            <TextAtom style={styles.value}>{summary.totalRoomCount}</TextAtom>
          </View>

          <View style={[styles.flex1, styles.alignEnd]}>
            <TextAtom style={styles.label}>
              {strings.hostelDetailsDashboard.noOfBeds}
            </TextAtom>
            <TextAtom style={styles.value}>{summary.totalBeds}</TextAtom>
          </View>
        </View>

        <View style={styles.rowBetween}>
          <View style={styles.flex1}>
            <TextAtom style={styles.label}>
              {strings.hostelDetailsDashboard.vacantBeds}{' '}
              <TextAtom style={styles.value}>
                {summary.totalVacantBeds}
              </TextAtom>
            </TextAtom>
          </View>

          <View style={[styles.flex1, styles.alignEnd]}>
            <TextAtom style={styles.label}>
              {strings.hostelDetailsDashboard.occupiedBeds}{' '}
              <TextAtom style={styles.valueRight}>
                {summary.totalOccupiedBeds}
              </TextAtom>
            </TextAtom>
          </View>
        </View>
      </View>
    );
  };

  const handleRoomPress = (room: any, isVacant: boolean) => {
    if (isVacant) {
      Toast.show({
        type: 'info',
        text2: strings.hostelDetailsDashboard.noRoomAllocated,
      });
      return;
    }

    fetchBedData(room.roomId);
  };

  return (
    <>
      <SafeAreaView edges={['bottom']} style={styles.container}>
        <FullscreenLoading isVisible={loader} />

        <View style={styles.paddingHorizontal}>{renderTotalCard()}</View>

        <FlatList
          showsVerticalScrollIndicator={false}
          data={reportData?.floorWiseRooms || []}
          keyExtractor={item => item.floorId.toString()}
          renderItem={({ item }) => (
            <FloorCard
              floor={item}
              getRoomColor={getRoomColor}
              onRoomPress={handleRoomPress}
            />
          )}
          ListEmptyComponent={
            <TextAtom style={styles.emptyText}>
              {strings.hostelDetailsDashboard.noDataFound}
            </TextAtom>
          }
          contentContainerStyle={styles.listContentPadding}
        />
      </SafeAreaView>
      <BedDetailsModal
        visible={modalVisible}
        bedReportData={bedReportData}
        onClose={() => setModalVisible(false)}
      />
    </>
  );
};

export default HostelDetailsDashbaord;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundColor,
    paddingTop: vh(10),
  },
  card: {
    backgroundColor: colors.white,
    marginVertical: vw(4),
    borderRadius: vw(8),
    paddingHorizontal: vw(15),
    paddingVertical: vh(8),
    shadowColor: colors.black,
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
    width: vw(320),
    marginLeft: vh(2),
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: vh(4),
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
  },
  valueRight: {
    fontFamily: fonts.Roboto_Regular,
    fontSize: vw(14),
    color: colors.grey,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: vh(40),
    color: colors.grey,
    fontFamily: fonts.Roboto_Medium,
  },

  floorCard: {
    backgroundColor: colors.lightBlue,
    marginTop: vh(15),
    padding: vw(15),
    borderRadius: vw(10),
  },
  floorTitle: {
    fontFamily: fonts.Roboto_Bold,
    fontSize: vw(14),
    color: colors.primary,
    marginBottom: vh(5),
  },
  line: {
    height: 1,
    backgroundColor: colors.primary,
    marginVertical: vh(5),
  },
  roomsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: vw(10),
    marginTop: vh(10),
  },
  roomBox: {
    paddingVertical: vh(4),
    paddingHorizontal: vw(8),
    borderRadius: vw(6),
    alignItems: 'center',
    justifyContent: 'center',
  },
  roomText: {
    fontFamily: fonts.Roboto_Medium,
    fontSize: vw(14),
    color: colors.black,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    padding: vw(20),
  },
  modalBox: {
    backgroundColor: colors.white,
    borderRadius: vw(12),
    padding: vw(15),
    maxHeight: '85%',
  },
  closeBtn: {
    alignSelf: 'flex-end',
    padding: vw(5),
  },

  bedCard: {
    // marginBottom: vh(20),
  },
  tag: {
    backgroundColor: colors.lightBlue,
    paddingVertical: vh(6),
    paddingHorizontal: vw(10),
    borderRadius: vw(6),
    width: vw(130),
  },
  tagText: {
    fontFamily: fonts.Roboto_Medium,
    fontSize: vw(13),
    color: colors.primary,
    textAlign: 'center',
  },
  bedTag: {
    backgroundColor: colors.paleBlue,
    paddingVertical: vh(6),
    marginTop: vh(10),
    borderRadius: vw(6),
    alignItems: 'center',
  },
  bedTagText: {
    fontSize: vw(14),
    color: colors.primary,
    fontFamily: fonts.Roboto_Medium,
  },
  nameText: {
    fontSize: vw(12),
    fontFamily: fonts.Roboto_Regular,
    marginTop: vh(4),
    color: colors.grey,
  },
  mobileText: {
    fontSize: vw(12),
    marginTop: vh(4),
    color: colors.grey,
    fontFamily: fonts.Roboto_Regular,
  },
  dateText: {
    fontSize: vw(12),
    marginTop: vh(4),
    color: colors.grey,
    fontFamily: fonts.Roboto_Regular,
  },
  trainingText: {
    fontSize: vw(14),
    marginTop: vh(12),
    fontFamily: fonts.Roboto_Bold,
    textAlign: 'center',
    color: colors.primary,
  },
  divider: {
    height: 1,
    backgroundColor: colors.mediumGray,
    marginVertical: vh(12),
  },
  flex1: {
    flex: 1,
  },
  alignCenter: {
    alignItems: 'center',
  },
  alignEnd: {
    alignItems: 'flex-end',
  },
  closeButtonText: {
    fontSize: vw(18),
    color: colors.primary,
  },
  modalScrollContent: {
    paddingBottom: vh(20),
  },
  paddingHorizontal: {
    paddingHorizontal: vw(15),
  },
  listContentPadding: {
    paddingHorizontal: vw(15),
    paddingBottom: vh(30),
  },
  summaryCardBg: {
    backgroundColor: colors.lightBlue,
  },
});
