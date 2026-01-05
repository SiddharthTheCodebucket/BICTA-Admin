import * as React from 'react';
import { StyleSheet } from 'react-native';
import { isNullUndefined } from '../../utils/CommonFunction';
import { colors, fonts, vh, vw } from '../../constants';
import { useAndroidBackButton } from '../../hooks/behaviour';
import ViewAtom from '../atoms/ViewAtom';
import TextAtom from '../atoms/TextAtom';
import TouchableAtom from '../atoms/TouchableAtom';
import { NavigationType } from './HeaderOrganism';

interface Props {
  navigation: NavigationType;
  route: any;
}

const AlertOrganism = (props: Props) => {
  const { navigation } = props;
  const {
    title,
    message,
    okText,
    cancelText,
    cancelFunction,
    okFunction,
    double,
  } = props.route.params;

  const goBack = () => {
    navigation?.pop();
  };
  const backAction = () => {
    goBack();
    return true;
  };

  useAndroidBackButton(backAction, [navigation]);

  if (double) {
    return (
      <ViewAtom style={styles.modalContainer}>
        <ViewAtom style={styles.mainContainer}>
          {!isNullUndefined(title) && (
            <TextAtom
              style={{
                ...styles.titleText,
                marginTop: isNullUndefined(title) ? vh(0) : vh(24),
              }}
            >
              {title}
            </TextAtom>
          )}
          <TextAtom numberOfLines={3} style={styles.messageText}>
            {message}
          </TextAtom>
          <ViewAtom style={styles.separator} />
          <ViewAtom style={styles.row}>
            <TouchableAtom
              onPress={() => {
                navigation?.pop();
                cancelFunction();
              }}
              activeOpacity={0.6}
              style={styles.buttonView}
            >
              <TextAtom style={styles.cancelButtonText}>
                {cancelText ?? 'cancel'}
              </TextAtom>
            </TouchableAtom>
            <ViewAtom style={styles.line} />
            <TouchableAtom
              onPress={() => {
                navigation?.pop();
                okFunction();
              }}
              activeOpacity={0.6}
              style={styles.buttonView}
            >
              <TextAtom style={styles.okButtonText}>
                {' '}
                {okText ?? 'ok'}{' '}
              </TextAtom>
            </TouchableAtom>
          </ViewAtom>
        </ViewAtom>
      </ViewAtom>
    );
  } else {
    return (
      <ViewAtom style={styles.modalContainer}>
        <ViewAtom style={styles.mainContainer}>
          <TextAtom
            style={{
              ...styles.titleText,
              marginTop: isNullUndefined(title) ? vh(0) : vh(24),
            }}
          >
            {title}
          </TextAtom>

          <TextAtom style={styles.messageText}> {message} </TextAtom>
          <ViewAtom style={styles.separator} />
          <TouchableAtom
            onPress={() => {
              navigation.pop();
              okFunction();
            }}
            activeOpacity={0.6}
            style={styles.buttonView}
          >
            <TextAtom style={styles.okButtonText}> {okText ?? 'ok'} </TextAtom>
          </TouchableAtom>
        </ViewAtom>
      </ViewAtom>
    );
  }
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.borderColor,
  },
  mainContainer: {
    width: vw(305),
    backgroundColor: colors.white,
    borderRadius: vw(8),
  },
  titleText: {
    fontFamily: fonts.Roboto_Medium,
    fontSize: vw(14),
    color: colors.black,
    textAlign: 'center',
    alignSelf: 'center',
  },
  messageText: {
    fontFamily: fonts.Roboto_Regular,
    fontSize: vw(12),
    textAlign: 'center',
    marginTop: 24,
    marginBottom: 20,
    color: colors.black80per,
    width: vw(273),
    alignSelf: 'center',
  },
  separator: {
    height: 1,
    width: '100%',
    backgroundColor: colors.chinese_silver,
    opacity: 0.6,
  },
  line: {
    backgroundColor: colors.chinese_silver,
    marginTop: 5,
    width: 1,
    height: 35,
    opacity: 0.6,
  },
  row: {
    flexDirection: 'row',
  },
  buttonView: {
    width: vw(152.5),
    height: 44,
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontFamily: fonts.Roboto_Regular,
    fontSize: vw(14),
    color: colors.black,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  okButtonText: {
    fontFamily: fonts.Roboto_Regular,
    fontSize: vw(16),
    color: colors.red_2,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
});

export default AlertOrganism;
