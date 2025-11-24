import React, {forwardRef, useState} from 'react';
import {StyleSheet, ViewStyle, View} from 'react-native';
import TextInputAtom from '../atoms/TextInputAtom';
import {colors, fonts, images, vh, vw} from '../../constants';
import TouchableAtom from '../atoms/TouchableAtom';
import {isNullUndefined} from '../../utils/CommonFunction';
import ImageAtom from '../atoms/ImageAtom';

interface TextInputMoleculeProps {
  style?: ViewStyle;
  disabled?: boolean;
  errorMessage?: string;
  onPress?: () => void;
  secureTextEntry?: boolean;
  isRenderLeft?: () => React.ReactNode;
  isRenderRight?: () => React.ReactNode;
}

const TextInputMolecule = forwardRef<
  typeof TextInputAtom | null,
  TextInputMoleculeProps
>(
  (
    {
      style,
      disabled,
      errorMessage,
      onPress,
      secureTextEntry,
      isRenderLeft,
      isRenderRight,
      ...textInputProps
    },
    ref: any,
  ) => {
    const [toggleShow, setToggleShow] = useState<boolean>(false);
    const [showTextEntry, setShowTextEntry] = useState<boolean>(
      secureTextEntry || false,
    );

    const handleToggleText = () => {
      setToggleShow(!toggleShow);
      setShowTextEntry(!showTextEntry);
    };

    const renderPasswordToggle = () => (
      <TouchableAtom
        onPress={handleToggleText}
        style={styles.passwordIconContainer}>
        <ImageAtom
          source={toggleShow ? images.eyeOpen : images.eyeClose}
          style={styles.passwordToggle}
          resizeMode={'contain'}
        />
      </TouchableAtom>
    );

    return (
      <TouchableAtom
        activeOpacity={1}
        style={[
          styles.inputBoxView,
          style,
          {
            backgroundColor: disabled
              ? colors.disabledColor
              : colors.backgroundColor,
            borderColor: isNullUndefined(errorMessage)
              ? colors.grey_1
              : colors.red,
            paddingHorizontal: vw(10),
          },
        ]}
        onPress={() => {
          ref?.current.focus();
          if (onPress) {
            onPress();
          }
        }}
        disabled={disabled}>
        {isRenderLeft?.()}
        <View
          style={[
            styles.textInputContainer,
            {
              marginLeft: isRenderLeft ? vw(10) : 0,
              marginRight: isRenderRight ? vw(10) : 0,
            },
          ]}>
          <TextInputAtom
            {...textInputProps}
            ref={ref}
            secureTextEntry={showTextEntry}
          />
        </View>
        {secureTextEntry && renderPasswordToggle()}
        {isRenderRight?.()}
      </TouchableAtom>
    );
  },
);

export default TextInputMolecule;

const styles = StyleSheet.create({
  container: {
    marginBottom: vh(10),
  },
  labelStyle: {
    marginBottom: vh(10),
    fontSize: vw(14),
    fontFamily: fonts.Roboto_Medium,
  },
  inputBoxView: {
    flexDirection: 'row',
    borderRadius: vw(4),
    width: vw(328),
    height: vh(48),
    justifyContent: 'center',
    alignSelf: 'center',
    borderWidth: vw(1),
    alignItems: 'center',
    marginTop: vh(8),
  },
  passwordIconContainer: {
    height: vw(25),
    width: vw(25),
    justifyContent: 'center',
    alignItems: 'center',
  },
  passwordToggle: {
    width: vw(25),
    height: vw(25),
    tintColor: colors.placeholderColor,
    resizeMode: 'contain',
  },
  textInputContainer: {
    flex: 1,
  },
});
