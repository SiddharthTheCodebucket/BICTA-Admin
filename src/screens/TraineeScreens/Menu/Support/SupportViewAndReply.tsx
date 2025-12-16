import React, { createRef, useEffect, useLayoutEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  FlatList,
  Linking,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import moment from 'moment';
import * as Yup from 'yup';
import { colors, fonts, screensName, vh, vw } from '../../../../constants';
import {
  Header,
  NavigationType,
} from '../../../../components/organisms/HeaderOrganism';
import TextAtom from '../../../../components/atoms/TextAtom';
import TouchableAtom from '../../../../components/atoms/TouchableAtom';
import FullscreenLoading from '../../../../components/organisms/FullscreenLoading';
import {
  useSupportListTicketMovementMutation,
  useSupportResolveComplainMutation,
} from '../../../../injectEndpointsTrainee/supportEndpoints';
import TextInputOrganisms from '../../../../components/organisms/TextInputOrganisms';
import ImageUploadOrganism from '../../../../components/organisms/ImageUploadOrganism';
import ButtonOrganism from '../../../../components/organisms/ButtonOrganism';
import { CommonActions } from '@react-navigation/native';

interface Props {
  route: any;
  navigation: NavigationType;
}

const errorInitialData = {
  replyMsg: '',
};

const SupportViewAndReply = (props: Props) => {
  const { navigation } = props;
  const item = props.route.params?.item;

  const input1_ref: any = createRef();

  const [supportListTicketMovementApi] = useSupportListTicketMovementMutation();
  const [supportResolveComplaintApi] = useSupportResolveComplainMutation();

  const [data, setData] = useState<any>([]);
  const [loader, setLoader] = useState(false);

  const [replyMsg, setReplyMsg] = useState('');
  const [file, setFile] = useState<any>({});

  const [error, setError] = useState(errorInitialData);

  useLayoutEffect(() => {
    Header.setNavigation(navigation, 'Complain Details');
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
      itemsPerPage: 50,
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

  const isValidate = () => {
    try {
      const accountInfoSchema = Yup.object().shape({
        replyMsg: Yup.string().required('Your message is required'),
      });
      accountInfoSchema.validateSync({
        replyMsg: replyMsg,
      });
      return true;
    } catch (err: any) {
      setError({ ...error, [err.path]: err.message });
      return false;
    }
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
          <TextAtom style={styles.key}>Category</TextAtom>
          <TextAtom style={styles.value}>{item.category}</TextAtom>
        </View>

        <View style={{ flex: 1, alignItems: 'flex-end' }}>
          <TextAtom style={styles.key}>Sub Category</TextAtom>
          <TextAtom style={styles.value}>{item.subCategory}</TextAtom>
        </View>
      </View>

      <View>
        <TextAtom style={styles.key}>Issue Type</TextAtom>
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

      <View style={{ marginTop: vh(6) }}>
        <TextAtom style={styles.key}>Last Action By</TextAtom>
        <TextAtom style={styles.value}>{item.lastActionTakenBy}</TextAtom>
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
            {moment().diff(moment(item.createdAt), 'days')} days ago
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

  const renderAddReplySection = () => (
    <View
      style={{
        marginTop: vh(20),
        paddingTop: vh(10),
        paddingBottom: vh(20),
        backgroundColor: colors.grey_5,
        paddingHorizontal: vw(15),
        elevation: 3,
        width: '100%',
      }}
    >
      <TextAtom
        style={{
          fontFamily: fonts.Roboto_Bold,
          fontSize: vw(16),
          color: colors.black,
          width: '100%',
          marginBottom: vh(8),
        }}
      >
        Add Reply
      </TextAtom>

      <TextInputOrganisms
        label={'Your Message'}
        placeholder={'Your Message'}
        ref={input1_ref}
        onSubmitEditing={() => Keyboard.dismiss()}
        value={replyMsg}
        autoCapitalize={'none'}
        returnKeyType={'next'}
        onChangeText={(val: string) => {
          setReplyMsg(val);
          setError({ ...error, replyMsg: '' });
        }}
        isMandatory
        errorMessage={error.replyMsg}
      />

      <ImageUploadOrganism
        label="Choose File"
        buttonText="Choose File"
        onSelectImage={(file: any) => {
          setFile(file);
        }}
        defaultImage={file?.uri}
      />

      <ButtonOrganism
        onPress={() => {
          if (isValidate()) {
            submitAndReply();
          }
        }}
        bttnText="Submit & Reply"
      />
    </View>
  );

  const submitAndReply = () => {
    setLoader(true);
    const formData = new FormData();
    formData.append('ticketRaisedId', item.raiseComplainId);
    formData.append('reply', replyMsg);
    if (file) {
      formData.append('file', {
        uri: file.uri,
        name: file.fileName,
        type: file.type,
      });
    }
    supportResolveComplaintApi(formData)
      .unwrap()
      .then((res: any) => {
        navigation.goBack();
        props.route.params?.onDone?.();
        Toast.show({
          type: 'success',
          text2: res.data.message,
        });
        setLoader(false);
      })
      .catch((err: any) => {
        Toast.show({
          type: 'error',
          text2: err?.data?.message || 'Something went wrong',
        });
        setLoader(false);
      });
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <SafeAreaView edges={['bottom']} style={styles.container}>
        <FullscreenLoading isVisible={loader} />

        <TextAtom numberOfLines={0} style={styles.title}>
          {item.subject}
        </TextAtom>
        <TextAtom style={styles.daysAgo}>
          Ticket Raised {moment().diff(moment(item.createdDate), 'days')} days
          ago
        </TextAtom>

        <FlatList
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={<>{renderTicketDetails()}</>}
          data={filteredReplies}
          renderItem={renderReplyCard}
          keyExtractor={it => it.id.toString()}
          ListEmptyComponent={
            !loader ? (
              <TextAtom style={styles.noReplies}>No replies found</TextAtom>
            ) : null
          }
          ListFooterComponent={<>{renderAddReplySection()}</>}
          keyboardShouldPersistTaps="handled"
        />
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
};

export default SupportViewAndReply;

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
});
