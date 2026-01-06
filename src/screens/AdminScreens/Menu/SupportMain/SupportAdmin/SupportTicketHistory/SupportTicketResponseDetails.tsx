import React, { useEffect, useLayoutEffect, useState } from 'react';
import { StyleSheet, View, FlatList, Linking, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import moment from 'moment';
import {
  colors,
  fonts,
  images,
  screensName,
  vh,
  vw,
} from '../../../../../../constants';
import {
  Header,
  NavigationType,
} from '../../../../../../components/organisms/HeaderOrganism';
import TextAtom from '../../../../../..//components/atoms/TextAtom';
import TouchableAtom from '../../../../../../components/atoms/TouchableAtom';
import FullscreenLoading from '../../../../../../components/organisms/FullscreenLoading';
import { useSupportListTicketMovementMutation } from '../../../../../../injectEndpointsTrainee/supportEndpoints';
import ImageAtom from '../../../../../../components/atoms/ImageAtom';

interface Props {
  route: any;
  navigation: NavigationType;
}

const SupportTicketResponseDetails = (props: Props) => {
  const { navigation } = props;
  const item = props.route.params?.item;

  const [supportListTicketMovementApi] = useSupportListTicketMovementMutation();

  const [data, setData] = useState<any>([]);
  const [loader, setLoader] = useState(false);

  useLayoutEffect(() => {
    Header.setNavigation(navigation, 'Support Ticket Details');
    navigation.BackButtonPress = () => navigation.goBack();
  }, [navigation]);

  useEffect(() => {
    supportListTicketMovement();
  }, []);

  const supportListTicketMovement = () => {
    setLoader(true);

    const params = {
      trackingId: item?.trackingId,
      search: '',
      sort: {
        attributes: ['createdAt'],
        sorts: ['desc'],
      },
      filter: {},
      pageNo: 1,
    };

    supportListTicketMovementApi(params)
      .unwrap()
      .then((res: any) => {
        setLoader(false);
        const newData = res.data?.data ?? [];
        setData(newData);
      })
      .catch((err: any) => {
        setLoader(false);
        Toast.show({
          type: 'error',
          text2: err.data?.message || 'Something went wrong',
        });
      });
  };

  const renderTicketDetails = () => (
    <View style={styles.detailsCard}>
      <TextAtom style={styles.detailsHeading}>Ticket Details</TextAtom>
      <View style={styles.separator} />
      <View style={styles.detailsRow}>
        <View style={{ flex: 1 }}>
          <TextAtom style={styles.key}>Tracking Id</TextAtom>
          <TextAtom style={styles.value}>{item.trackingId}</TextAtom>
        </View>

        <View style={{ flex: 1, alignItems: 'flex-end' }}>
          <TextAtom style={styles.key}>Ticket Status</TextAtom>
          <TextAtom style={[styles.value, { color: colors.primary }]}>
            {item.currentStatus}
          </TextAtom>
        </View>
      </View>
      <View style={styles.detailsRow}>
        <View style={{ flex: 1 }}>
          <TextAtom style={styles.key}>Created On</TextAtom>
          <TextAtom style={styles.value}>
            {moment(item.createdDate).format('DD-MMM-YYYY')}
          </TextAtom>
        </View>

        <View style={{ flex: 1, alignItems: 'flex-end' }}>
          <TextAtom style={styles.key}>Updated On</TextAtom>
          <TextAtom style={styles.value}>
            {moment(item.updatedAt).format('DD-MMM-YYYY')}
          </TextAtom>
        </View>
      </View>

      <View style={styles.detailsRow}>
        <View style={{ flex: 1 }}>
          <TextAtom style={styles.key}>Last Action By</TextAtom>
          <TextAtom style={styles.value}>{item.lastActionTakenBy}</TextAtom>
        </View>

        <View style={{ flex: 1, alignItems: 'flex-end' }}>
          <TextAtom style={styles.key}>Category</TextAtom>
          <TextAtom style={styles.value}>{item.category}</TextAtom>
        </View>
      </View>

      <View>
        <TextAtom style={styles.key}>Primary Issue Type</TextAtom>
        <TextAtom numberOfLines={0} style={styles.value}>
          {item.primaryIssueType}
        </TextAtom>
      </View>

      <View style={{ marginTop: vh(6) }}>
        <TextAtom style={styles.key}>Current Issue Type</TextAtom>
        <TextAtom numberOfLines={0} style={styles.value}>
          {item.issueType}
        </TextAtom>
      </View>
      <View style={{ marginTop: vh(6) }}>
        <TextAtom style={styles.key}>Description</TextAtom>
        <TextAtom numberOfLines={0} style={styles.value}>
          {item.description}
        </TextAtom>
      </View>
    </View>
  );

  const renderTicketHistory = () => (
    <View style={styles.detailsCard}>
      <View style={styles.ticketHistoryHeader}>
        <TextAtom style={styles.detailsHeading}>Ticket History</TextAtom>

        {data.length >= 1 && (
          <TouchableAtom
            onPress={() => {
              navigation.navigate(screensName.SupportTicketMovementDetails, {
                movementList: data,
              });
            }}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <ImageAtom
              source={images.eyeOpen}
              style={styles.eyeIcon}
              resizeMode="contain"
            />
          </TouchableAtom>
        )}
      </View>
      <View style={styles.separator} />

      <View style={styles.detailsRow}>
        <TextAtom style={styles.key}>Tracking Id</TextAtom>
        <TextAtom style={styles.value}>{item.trackingId}</TextAtom>
      </View>

      <View style={styles.detailsRow}>
        <TextAtom style={styles.key}>Created on</TextAtom>
        <TextAtom style={styles.value}>
          {moment(item.createdDate).format('DD/MM/YYYY')}
        </TextAtom>
      </View>

      <View style={styles.detailsRow}>
        <TextAtom style={styles.key}>Updated on</TextAtom>
        <TextAtom style={styles.value}>
          {moment(item.updatedAt).format('DD/MM/YYYY')}
        </TextAtom>
      </View>

      <View style={styles.detailsRow}>
        <TextAtom style={styles.key}>Due Date</TextAtom>
        <TextAtom style={styles.value}>
          {moment(item.dueDate).format('DD/MM/YYYY')}
        </TextAtom>
      </View>

      <View style={styles.detailsRow}>
        <TextAtom style={styles.key}>Last Replied</TextAtom>
        <TextAtom style={styles.value}>{item.lastActionTakenBy}</TextAtom>
      </View>

      <View style={styles.detailsRow}>
        <TextAtom style={styles.key}>Current Status</TextAtom>
        <TextAtom style={[styles.value, { color: colors.primary }]}>
          {item.currentStatus}
        </TextAtom>
      </View>

      <View style={{ marginTop: vh(0) }}>
        <TextAtom style={styles.key}>Primary Issue Type</TextAtom>
        <TextAtom style={styles.value}>{item.primaryIssueType}</TextAtom>
      </View>

      <View style={{ marginTop: vh(6) }}>
        <TextAtom style={styles.key}>Current Issue Type</TextAtom>
        <TextAtom style={styles.value}>{item.issueType}</TextAtom>
      </View>
    </View>
  );
  const renderReporterDetails = () => (
    <View style={styles.detailsCard}>
      <TextAtom style={styles.detailsHeading}>Reporter Details</TextAtom>
      <View style={styles.separator} />

      <View style={styles.detailsRow}>
        <TextAtom style={styles.key}>Contact</TextAtom>
        <TextAtom style={styles.value}>{item.name}</TextAtom>
      </View>

      <View style={styles.detailsRow}>
        <TextAtom style={styles.key}>Phone No.</TextAtom>
        <TextAtom style={styles.value}>{item.phone}</TextAtom>
      </View>

      <View>
        <TextAtom style={styles.key}>Queries</TextAtom>
        <TextAtom style={styles.value}>{item.subject}</TextAtom>
      </View>
    </View>
  );

  const renderReplyCard = ({ item }: any) => {
    if (!item.reply) return null;
    return (
      <View style={styles.replyCard}>
        <View style={styles.replyHeader}>
          <TextAtom style={styles.replyBy}>Reply By {item.assignedBy}</TextAtom>

          <TextAtom style={styles.replyTime}>
            {moment(item.createdAt).format('DD-MMM-YYYY')}
          </TextAtom>
        </View>

        {item.reply ? (
          <TextAtom style={styles.replyText}>{item.reply}</TextAtom>
        ) : null}

        {item.attachment ? (
          <TouchableAtom
            onPress={() => Linking.openURL(item.attachment)}
            style={{ marginTop: vh(6) }}
          >
            <TextAtom style={styles.attachment}>View Attachment</TextAtom>
          </TouchableAtom>
        ) : null}
      </View>
    );
  };

  const filteredReplies = data.filter((d: any) => d.reply || d.attachment);

  return (
    <SafeAreaView edges={['bottom']} style={styles.container}>
      <FullscreenLoading isVisible={loader} />

      <TextAtom numberOfLines={0} style={styles.title}>
        {item.subject}
      </TextAtom>
      <TextAtom style={styles.daysAgo}>
        Ticket Raised {moment().diff(moment(item.createdDate), 'days')} days ago
      </TextAtom>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: vh(20) }}
      >
        {renderTicketDetails()}
        <View style={{ marginTop: vh(10) }} />
        {renderTicketHistory()}
        <View style={{ marginTop: vh(10) }} />
        {renderReporterDetails()}
        <View style={{ marginTop: vh(10) }} />
        <FlatList
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={<>{}</>}
          data={filteredReplies}
          renderItem={renderReplyCard}
          keyExtractor={it => it.id.toString()}
          ListEmptyComponent={
            loader ? null : (
              <TextAtom style={styles.noReplies}>No replies found</TextAtom>
            )
          }
          keyboardShouldPersistTaps="handled"
        />
      </ScrollView>
    </SafeAreaView>
  );
};

export default SupportTicketResponseDetails;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.backgroundColor },

  title: {
    fontSize: vw(16),
    fontFamily: fonts.Roboto_Medium,
    marginHorizontal: vw(15),
    marginTop: vh(10),
    color: colors.black,
  },

  daysAgo: {
    marginHorizontal: vw(15),
    color: colors.grey,
    marginBottom: vh(10),
    fontFamily: fonts.Roboto_Regular,
    fontSize: vw(12),
  },

  detailsCard: {
    backgroundColor: colors.white,
    marginHorizontal: vw(15),
    padding: vw(15),
    borderRadius: vw(10),
    elevation: 3,
  },

  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: vh(6),
  },

  key: {
    fontFamily: fonts.Roboto_Medium,
    color: colors.black,
    fontSize: vw(14),
  },

  value: {
    fontFamily: fonts.Roboto_Regular,
    color: colors.grey,
    fontSize: vw(14),
  },

  replyCard: {
    backgroundColor: colors.disabledColor,
    marginHorizontal: vw(15),
    padding: vw(15),
    borderRadius: vw(8),
    marginTop: vh(10),
  },

  replyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  replyBy: {
    fontFamily: fonts.Roboto_Medium,
    color: colors.black,
    fontSize: vw(14),
  },

  replyTime: {
    fontFamily: fonts.Roboto_Regular,
    color: colors.grey,
    fontSize: vw(14),
  },

  replyText: {
    marginTop: vh(8),
    color: colors.grey,
    fontSize: vw(12),
  },

  attachment: {
    color: colors.primary,
    fontSize: vw(12),
  },

  noReplies: {
    textAlign: 'center',
    marginTop: vh(20),
    color: colors.grey,
  },

  addReplyCard: {
    backgroundColor: colors.white,
    padding: vw(15),
    borderRadius: vw(10),
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },

  addReplyTitle: {
    fontFamily: fonts.Roboto_Medium,
    fontSize: vw(16),
    marginBottom: vh(10),
  },

  submitBtn: {
    backgroundColor: colors.primary,
    paddingVertical: vh(12),
    borderRadius: vw(30),
    alignItems: 'center',
    marginTop: vh(15),
  },

  submitText: {
    color: colors.white,
    fontFamily: fonts.Roboto_Medium,
  },

  detailsHeading: {
    fontFamily: fonts.Roboto_Medium,
    fontSize: vw(16),
    marginBottom: vh(8),
    color: colors.black,
  },

  separator: {
    height: 1,
    backgroundColor: colors.chinese_silver,
    marginBottom: vh(12),
  },
  ticketHistoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  eyeIcon: {
    width: vw(20),
    height: vw(20),
    tintColor: colors.primary,
  },
});
