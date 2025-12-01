import React, { useEffect, useLayoutEffect, useState } from 'react';
import { StyleSheet, View, FlatList, Modal, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, fonts, vw, vh } from '../../../constants';
import TextAtom from '../../../components/atoms/TextAtom';
import {
  useHostelBedDetailsDataMutation,
  useHostelRoomDetailsDataMutation,
} from '../../../injectEndpoints/dashboardEndpoints';
import Toast from 'react-native-toast-message';
import FullscreenLoading from '../../../components/organisms/FullscreenLoading';
import TouchableAtom from '../../../components/atoms/TouchableAtom';
import ViewAtom from '../../../components/atoms/ViewAtom';
import { Header } from '../../../components/organisms/HeaderOrganism';

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
        Toast.show({ type: 'error', text2: 'Something went wrong' });
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
        Toast.show({ type: 'error', text2: 'Something went wrong' });
      });
  };

  const getRoomColor = (vacantBeds: any, totalBeds: any) => {
    if (vacantBeds === totalBeds) return '#4CAF50';
    if (vacantBeds === 0) return '#FF5252';
    return '#FFB74D';
  };

  const FloorCard = ({ floor }: any) => {
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
                onPress={() => {
                  if (isVacant) {
                    Toast.show({ type: 'info', text2: 'No Room Allocated' });
                  } else {
                    fetchBedData(room.roomId);
                  }
                }}
              >
                <TextAtom style={styles.roomText}>{room.roomNo}</TextAtom>
              </TouchableAtom>
            );
          })}
        </View>
      </View>
    );
  };

  const renderTotalCard = () => {
    return (
      <View style={[styles.card, { backgroundColor: '#E8F0FE' }]}>
        <View style={[styles.rowBetween, { alignItems: 'flex-start' }]}>
          <View style={{ flex: 1 }}>
            <TextAtom style={styles.label}>No of floors</TextAtom>
            <TextAtom style={styles.value}>{summary.totalFloorCount}</TextAtom>
          </View>

          <View style={{ flex: 1, alignItems: 'center' }}>
            <TextAtom style={styles.label}>No of Rooms</TextAtom>
            <TextAtom style={styles.value}>{summary.totalRoomCount}</TextAtom>
          </View>

          <View style={{ flex: 1, alignItems: 'flex-end' }}>
            <TextAtom style={styles.label}>No of Beds</TextAtom>
            <TextAtom style={styles.value}>{summary.totalBeds}</TextAtom>
          </View>
        </View>

        <View style={styles.rowBetween}>
          <View style={{ flex: 1 }}>
            <TextAtom style={styles.label}>
              Vacant Beds:{' '}
              <TextAtom style={styles.value}>
                {summary.totalVacantBeds}
              </TextAtom>
            </TextAtom>
          </View>

          <View style={{ flex: 1, alignItems: 'flex-end' }}>
            <TextAtom style={styles.label}>
              Occupied Beds:{' '}
              <TextAtom style={styles.valueRight}>
                {summary.totalOccupiedBeds}
              </TextAtom>
            </TextAtom>
          </View>
        </View>
      </View>
    );
  };

  const BedDetailsModal = () => {
    return (
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <TouchableAtom
              style={styles.closeBtn}
              onPress={() => setModalVisible(false)}
            >
              <TextAtom style={{ fontSize: vw(18), color: colors.primary }}>
                ✕
              </TextAtom>
            </TouchableAtom>

            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: vh(20) }}
            >
              {bedReportData.map((bed: any, index: number) => {
                const detail = bed.allocatedDetails[0];

                return (
                  <View key={index} style={styles.bedCard}>
                    <View style={styles.rowBetween}>
                      <View style={styles.tag}>
                        <TextAtom numberOfLines={0} style={styles.tagText}>
                          Floor Name
                        </TextAtom>
                        <TextAtom numberOfLines={0} style={styles.tagText}>
                          {bed?.floorNumber}
                        </TextAtom>
                      </View>

                      <View style={styles.tag}>
                        <TextAtom style={styles.tagText}>Room Number</TextAtom>
                        <TextAtom style={styles.tagText}>
                          {bed?.roomNo}
                        </TextAtom>
                      </View>
                    </View>

                    <View style={styles.bedTag}>
                      <TextAtom style={styles.bedTagText}>
                        Bed Number: {bed?.bedNumber}
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
                        From: {detail?.trainingStartDate}
                      </TextAtom>

                      <TextAtom style={styles.dateText}>
                        To: {detail?.trainingEndDate}
                      </TextAtom>
                    </View>

                    <TextAtom style={styles.trainingText}>
                      Training: {detail?.trainingName}
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

  return (
    <>
      <SafeAreaView edges={['bottom']} style={styles.container}>
        <FullscreenLoading isVisible={loader} />

        <View style={{ paddingHorizontal: vw(15) }}>{renderTotalCard()}</View>

        <FlatList
          showsVerticalScrollIndicator={false}
          data={reportData?.floorWiseRooms || []}
          keyExtractor={item => item.floorId.toString()}
          renderItem={({ item }) => <FloorCard floor={item} />}
          ListEmptyComponent={
            <TextAtom style={styles.emptyText}>No Data Found</TextAtom>
          }
          contentContainerStyle={{
            paddingHorizontal: vw(15),
            paddingBottom: vh(30),
          }}
        />
      </SafeAreaView>

      <BedDetailsModal />
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
    backgroundColor: '#E8F0FE',
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
    backgroundColor: '#E8F0FE',
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
    backgroundColor: '#DDE8FF',
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
    backgroundColor: '#E0E0E0',
    marginVertical: vh(12),
  },
});
