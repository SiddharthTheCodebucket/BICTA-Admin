import React, { useLayoutEffect, useMemo } from 'react';
import { StyleSheet, FlatList, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Header } from '../../../../../../components/organisms/HeaderOrganism';
import TextAtom from '../../../../../../components/atoms/TextAtom';
import ViewAtom from '../../../../../../components/atoms/ViewAtom';
import { colors, fonts, vh, vw } from '../../../../../../constants';

const flattenOfficers = (list: any[] = []) => {
  if (!Array.isArray(list) || list.length === 0) return [];

  const result: any[] = [];
  let index = 1;

  list.forEach(block => {
    block?.names?.forEach((n: any) => {
      result.push({
        id: n.id ?? index,
        name: n.name ?? '-',
        mobileNo: n.mobileNo ?? '-',
        typeName: block.typeName ?? '-',
        trainingName: block.trainingName,
        batchNo: block.batchNo,
        index: index++,
      });
    });
  });

  return result;
};

const OfficerCard = ({ item }: any) => {
  return (
    <ViewAtom style={styles.officerCard}>
      <TextAtom numberOfLines={0} style={styles.officerName}>
        {item.index}. {item.name} ({item.mobileNo})
      </TextAtom>

      <TextAtom numberOfLines={0} style={styles.officerMeta}>
        Type: {item.typeName}
      </TextAtom>

      {item.trainingName && (
        <TextAtom numberOfLines={0} style={styles.officerMeta}>
          Training: {item.trainingName}
        </TextAtom>
      )}
      {item.batchNo && (
        <TextAtom numberOfLines={0} style={styles.officerMeta}>
          {item.batchNo ? `Group: ${item.batchNo}` : ''}
        </TextAtom>
      )}
    </ViewAtom>
  );
};

const ManagementInchargeDetails = ({ navigation, route }: any) => {
  const item = route?.params?.item;

  useLayoutEffect(() => {
    Header.setNavigation(navigation, 'Management Incharge Details');
    navigation.BackButtonPress = () => navigation.goBack();
  }, [navigation]);

  const protocolList = useMemo(
    () => flattenOfficers(item?.protocolOfficers),
    [item],
  );

  const liaisonList = useMemo(
    () => flattenOfficers(item?.liaisonOfficers),
    [item],
  );

  if (!item) {
    return (
      <SafeAreaView edges={['bottom']} style={styles.container}>
        <TextAtom style={styles.emptyText}>Data not available</TextAtom>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={['bottom']} style={styles.container}>
      <ViewAtom style={{}}>
        <TextAtom numberOfLines={0} style={styles.conferenceTitle}>
          Conference Name:
        </TextAtom>
        <TextAtom numberOfLines={0} style={styles.conferenceName}>
          {item?.conferenceName}
        </TextAtom>
      </ViewAtom>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: vh(20) }}
      >
        <ViewAtom style={styles.sectionBox}>
          <TextAtom style={styles.sectionTitle}>
            Protocol Officers ({item?.protocolOfficersNameCount})
          </TextAtom>

          {protocolList.length === 0 ? (
            <TextAtom style={styles.emptyText}>
              No Protocol Officers Found
            </TextAtom>
          ) : (
            <FlatList
              data={protocolList}
              keyExtractor={i => i.id.toString()}
              renderItem={({ item }) => <OfficerCard item={item} />}
              scrollEnabled={false}
              removeClippedSubviews={false}
            />
          )}
        </ViewAtom>

        <ViewAtom style={styles.sectionBox}>
          <TextAtom style={styles.sectionTitle}>
            Liaison Officers ({item?.liaisonOfficersNameCount})
          </TextAtom>
          {liaisonList.length === 0 ? (
            <TextAtom style={styles.emptyText}>
              No Liaison Officers Found
            </TextAtom>
          ) : (
            <FlatList
              data={liaisonList}
              keyExtractor={i => i.id.toString()}
              renderItem={({ item }) => <OfficerCard item={item} />}
              scrollEnabled={false}
              removeClippedSubviews={false}
            />
          )}
        </ViewAtom>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ManagementInchargeDetails;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundColor,
    padding: vw(15),
  },

  conferenceTitle: {
    width: vw(328),
    alignSelf: 'center',
    fontFamily: fonts.Roboto_Bold,
    fontSize: vw(18),
    color: colors.black,
  },
  conferenceName: {
    width: vw(328),
    alignSelf: 'center',
    fontFamily: fonts.Roboto_Medium,
    fontSize: vw(16),
    color: colors.grey,
  },
  sectionBox: {
    backgroundColor: colors.white,
    marginHorizontal: vw(5),
    borderRadius: vw(8),
    paddingHorizontal: vw(15),
    paddingVertical: vh(8),
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    marginBottom: vh(5),
    marginTop: vh(10),
  },

  sectionTitle: {
    fontFamily: fonts.Roboto_Bold,
    fontSize: vw(16),
    color: colors.black,
    marginBottom: vh(10),
  },

  columnWrapper: {
    justifyContent: 'space-between',
  },

  officerCard: {
    width: '100%',
    backgroundColor: '#F8F8F8',
    borderRadius: vw(10),
    padding: vw(10),
    marginBottom: vh(10),
  },

  officerName: {
    fontFamily: fonts.Roboto_Medium,
    fontSize: vw(14),
    color: colors.black,
    marginBottom: vh(4),
  },

  officerMeta: {
    fontFamily: fonts.Roboto_Regular,
    fontSize: vw(13),
    color: colors.grey,
  },
  emptyText: {
    textAlign: 'center',
    fontFamily: fonts.Roboto_Medium,
    fontSize: vw(14),
    color: colors.grey,
    marginVertical: vh(10),
  },
});
