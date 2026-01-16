import React, { useLayoutEffect, useState } from 'react';
import { StyleSheet, ScrollView, Image, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import moment from 'moment';
import { launchImageLibrary } from 'react-native-image-picker';
import { colors, fonts, strings, vh, vw } from '../../../../../../constants';
import { Header } from '../../../../../../components/organisms/HeaderOrganism';
import TextAtom from '../../../../../../components/atoms/TextAtom';
import ViewAtom from '../../../../../../components/atoms/ViewAtom';
import { useHouseKeepingUploadTaskAssignedPhotoMutation } from '../../../../../../injectEndpoints/houseKeepingManagementEndpoints';
import Toast from 'react-native-toast-message';
import FullscreenLoading from '../../../../../../components/organisms/FullscreenLoading';

const formatNameWithId = (name?: string, id?: number) => {
  if (!name) return '-';
  if (!id) return name;
  return `${name} (${id})`;
};

const FieldRow = ({ label, value }: any) => (
  <ViewAtom style={styles.row}>
    <TextAtom style={styles.label}>{label}</TextAtom>
    <TextAtom style={styles.value}>{value ?? '-'}</TextAtom>
  </ViewAtom>
);

const FullWidthField = ({ label, value }: any) => (
  <ViewAtom style={styles.fullWidthBox}>
    <TextAtom style={styles.fullLabel}>{label}</TextAtom>
    <TextAtom style={styles.fullValue}>{value ?? '-'}</TextAtom>
  </ViewAtom>
);

const UploadableImageField = ({
  label,
  imageUri,
  photoType,
  taskId,
  onUploaded,
  setGlobalLoading,
}: {
  label: string;
  imageUri?: string;
  photoType: 'photoBeforeTask' | 'photoInBetweenTask' | 'photoAfterTask';
  taskId: number;
  onUploaded: (uri: string) => void;
  setGlobalLoading: (val: boolean) => void;
}) => {
  const [uploadTaskAssignedPhotoApi] =
    useHouseKeepingUploadTaskAssignedPhotoMutation();

  const openPicker = async () => {
    const result = await launchImageLibrary({
      mediaType: 'photo',
      quality: 0.8,
    });

    if (result.didCancel) return;

    const uri = result.assets?.[0]?.uri;
    if (!uri) return;

    try {
      setGlobalLoading(true);

      const formData = new FormData();
      formData.append('id', taskId);
      formData.append('photoType', photoType);
      formData.append('file', {
        uri,
        name: `${photoType}.jpg`,
        type: 'image/jpeg',
      } as any);

      await uploadTaskAssignedPhotoApi(formData).unwrap();

      onUploaded(uri);

      Toast.show({
        type: 'success',
        text2: 'Photo uploaded successfully',
      });
    } catch (err: any) {
      Toast.show({
        type: 'error',
        text2: err?.data?.message || strings.something_went_wrong,
      });
    } finally {
      setGlobalLoading(false);
    }
  };

  return (
    <ViewAtom style={styles.imageBox}>
      <TextAtom style={styles.fullLabel}>{label}</TextAtom>

      {imageUri ? (
        <>
          <Image source={{ uri: imageUri }} style={styles.image} />

          <TouchableOpacity style={styles.uploadBtn} onPress={openPicker}>
            <TextAtom style={styles.uploadText}>{'Re-upload'}</TextAtom>
          </TouchableOpacity>
        </>
      ) : (
        <TouchableOpacity style={styles.uploadPlaceholder} onPress={openPicker}>
          <TextAtom style={styles.uploadText}>{'Upload Photo'}</TextAtom>
        </TouchableOpacity>
      )}
    </ViewAtom>
  );
};

const TaskDetailDetails = ({ route, navigation }: any) => {
  const { data } = route.params || {};
  const [photoBefore, setPhotoBefore] = useState(data?.photoBeforeTask);
  const [photoBetween, setPhotoBetween] = useState(data?.photoInBetweenTask);
  const [photoAfter, setPhotoAfter] = useState(data?.photoAfterTask);
  const [uploading, setUploading] = useState(false);

  useLayoutEffect(() => {
    Header.setNavigation(navigation, 'Task Details');
    navigation.BackButtonPress = () => navigation.goBack();
  }, [navigation]);

  return (
    <SafeAreaView edges={['bottom']} style={styles.container}>
      <FullscreenLoading isVisible={uploading} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
      >
        <ViewAtom style={styles.card}>
          <FullWidthField
            label="Staff Name"
            value={formatNameWithId(data?.staffName, data?.staffId)}
          />

          <FullWidthField
            label="Support Admin Name"
            value={formatNameWithId(
              data?.supportAdminName,
              data?.supportAdminId,
            )}
          />

          <FieldRow label="Task Type" value={data?.taskType} />
          <FullWidthField label="Task Title" value={data?.taskTitle} />

          <FieldRow
            label="Start Date"
            value={
              data?.startDate
                ? moment(data.startDate).format('DD-MM-YYYY')
                : '-'
            }
          />
          <FieldRow
            label="End Date"
            value={
              data?.endDate ? moment(data.endDate).format('DD-MM-YYYY') : '-'
            }
          />
          <FieldRow label="Shift" value={data?.shift} />

          <FieldRow label="Campus" value={data?.locationCampus} />
          <FieldRow label="Building / Area" value={data?.buildingOrArea} />
          <FieldRow label="Floor" value={data?.hostelFloor} />
          <FieldRow
            label="Room / Sub Location"
            value={data?.roomNoOrSubLocation}
          />
          <FieldRow label="Other Sub Location" value={data?.otherSubLocation} />

          <FieldRow label="Priority" value={data?.priority} />
          <FieldRow label="Status" value={data?.currentStatus} />

          <FieldRow label="Assigned By" value={data?.assignedBy} />
          <FieldRow
            label="Created By / Supervisor"
            value={data?.createdByOrSupervisor}
          />
          <FieldRow label="Transferred From" value={data?.taskTransferedFrom} />
          <UploadableImageField
            label="Photo (Before Task)"
            imageUri={photoBefore}
            photoType="photoBeforeTask"
            taskId={data.id}
            onUploaded={setPhotoBefore}
            setGlobalLoading={setUploading}
          />

          <UploadableImageField
            label="Photo (In-Between Task)"
            imageUri={photoBetween}
            photoType="photoInBetweenTask"
            taskId={data.id}
            onUploaded={setPhotoBetween}
            setGlobalLoading={setUploading}
          />

          <UploadableImageField
            label="Photo (After Task)"
            imageUri={photoAfter}
            photoType="photoAfterTask"
            taskId={data.id}
            onUploaded={setPhotoAfter}
            setGlobalLoading={setUploading}
          />
        </ViewAtom>
      </ScrollView>
    </SafeAreaView>
  );
};

export default TaskDetailDetails;

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

  imageBox: {
    marginBottom: vh(15),
  },

  image: {
    width: '100%',
    height: vh(180),
    borderRadius: vw(8),
    marginTop: vh(5),
    resizeMode: 'contain',
  },

  uploadPlaceholder: {
    height: vh(180),
    borderRadius: vw(8),
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.grey,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: vh(5),
  },

  uploadBtn: {
    marginTop: vh(8),
    alignSelf: 'flex-end',
  },

  uploadText: {
    fontFamily: fonts.Roboto_Medium,
    fontSize: vw(13),
    color: colors.primary,
  },
  finalBtn: {
    marginTop: vh(12),
    backgroundColor: colors.primary,
    paddingVertical: vh(12),
    borderRadius: vw(8),
    alignItems: 'center',
  },

  finalBtnText: {
    color: colors.white,
    fontFamily: fonts.Roboto_Medium,
    fontSize: vw(14),
  },
});
