import React from 'react';
import { StyleSheet, ViewStyle } from 'react-native';
import { isNullUndefined, nFixedLines } from '../../utils/CommonFunction';
import { colors, fonts, images, vh, vw } from '../../constants';
import ErrorMolecule from '../molecules/ErrorMolecule';
import TouchableAtom from '../atoms/TouchableAtom';
import TextAtom from '../atoms/TextAtom';
import ViewAtom from '../atoms/ViewAtom';
import ImageAtom from '../atoms/ImageAtom';
import LabelWithMandatoryMolecules from '../molecules/LabelWithMandatoryMolecules';

interface Props {
  onPress: Function;
  inputText?: string;
  image?: any;
  containerStyle?: ViewStyle;
  contentContainerStyle?: ViewStyle;
  isDisabled?: boolean;
  placeholder: string;
  errorMessage?: string;
  onPressCross?: any;
  itemTitleStyle?: any;
  onPressCrossStyle?: any;
  placeholderStyle?: any;
  crossStyle?: any;
  downArrowStyle?: any;
  renderMultipleInput?: Function;
  dataLength?: number;
  errorMessageView?: ViewStyle;
  label: string;
  isMandatory?: boolean;
}

const DropDownOrganism = (props: Props) => {
  const renderContent = () => {
    if (props.renderMultipleInput) {
      return props.dataLength === 0 ? (
        <TextAtom
          {...nFixedLines(1)}
          style={{
            ...styles.itemTitle,
            ...props.placeholderStyle,
            color: colors.placeholderColor,
          }}
        >
          {props.placeholder}
        </TextAtom>
      ) : (
        props.renderMultipleInput()
      );
    } else if (isNullUndefined(props.inputText)) {
      return (
        <TextAtom
          {...nFixedLines(1)}
          style={{
            ...styles.itemTitle,
            ...props.placeholderStyle,
            color: colors.placeholderColor,
          }}
        >
          {props.placeholder}
        </TextAtom>
      );
    } else {
      return (
        <TextAtom
          {...nFixedLines(1)}
          style={{ ...styles.itemTitle, ...props.itemTitleStyle }}
        >
          {props.inputText}
        </TextAtom>
      );
    }
  };

  return (
    <ViewAtom style={[styles.container, props.containerStyle]}>
      <LabelWithMandatoryMolecules
        label={props.label}
        isMandatory={props.isMandatory}
      />
      <TouchableAtom
        style={{
          ...styles.inputStyle,
          ...props.contentContainerStyle,
          backgroundColor: props.isDisabled
            ? colors.disabledColor
            : colors.backgroundColor,
          borderColor: isNullUndefined(props.errorMessage)
            ? colors.borderColor
            : colors.red,
        }}
        disabled={props.isDisabled}
        onPress={() => props.onPress()}
      >
        {renderContent()}
        <ImageAtom
          source={images.downArrow}
          resizeMode="contain"
          style={[styles.downArrowStyle, { ...props.downArrowStyle }]}
        />
      </TouchableAtom>
      <ErrorMolecule
        errorMessage={props.errorMessage}
        errorMessageView={props.errorMessageView}
      />
    </ViewAtom>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: vh(10),
  },
  inputStyle: {
    width: vw(328),
    height: vh(48),
    borderWidth: vw(1),
    borderRadius: vw(4),
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: vw(13),
    marginTop: vh(8),
  },
  itemTitle: {
    fontFamily: fonts.Roboto_Regular,
    fontSize: vw(16),
    color: colors.placeholderColor,
    width: vw(285),
    includeFontPadding: false,
    paddingVertical: 0,
  },
  downArrowStyle: {
    width: vw(18),
    height: vh(18),
    resizeMode: 'contain',
  },
});

export default DropDownOrganism;
