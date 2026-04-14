import React from 'react';
import { ImageBackground, StyleSheet, View } from 'react-native';
import { colors, fonts, images, SvgSearch, vh, vw } from '../../../../../../constants';
import TextAtom from '../../../../../../components/atoms/TextAtom';
import TouchableAtom from '../../../../../../components/atoms/TouchableAtom';
import { globalStyles } from '../../../../../../utils/globalStyles/GlobalStyles';

type Props = {
  title: string;
  count?: number;
  onPressSearch?: () => void;
  onPressCreate?: () => void;
  createLabel?: string;
};

const ExaminationListHeader = ({
  title,
  count,
  onPressSearch,
  onPressCreate,
  createLabel = '+ Create',
}: Props) => {
  return (
    <View style={styles.headerRow}>
      <View style={styles.titleRow}>
        <TextAtom style={styles.headerTitle}>{title}</TextAtom>
        {typeof count === 'number' && (
          <TextAtom style={styles.headerCount}>({count})</TextAtom>
        )}
      </View>

      <View style={styles.actionsRow}>
        {!!onPressSearch && (
          <TouchableAtom style={styles.iconBtn} onPress={onPressSearch}>
            <SvgSearch width={vw(18)} height={vw(18)} />
          </TouchableAtom>
        )}

        {!!onPressCreate && (
          <TouchableAtom
            style={globalStyles.createButtonTouchable}
            onPress={onPressCreate}
          >
            <ImageBackground
              source={images.buttonGrad_25}
              style={globalStyles.createButton}
              imageStyle={globalStyles.createButtonImage}
              resizeMode="stretch"
            >
              <TextAtom style={globalStyles.createButtonText}>
                {createLabel}
              </TextAtom>
            </ImageBackground>
          </TouchableAtom>
        )}
      </View>
    </View>
  );
};

export default ExaminationListHeader;

const styles = StyleSheet.create({
  headerRow: {
    marginTop: vh(10),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  headerTitle: {
    fontFamily: fonts.Inter_Bold,
    fontSize: vw(32 / 2),
    color: colors.new_ui_heading,
  },
  headerCount: {
    marginLeft: vw(4),
    fontFamily: fonts.Inter_Regular,
    fontSize: vw(14),
    color: colors.new_ui_count,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    height: vh(44),
  },
  iconBtn: {
    width: vw(22),
    height: vw(22),
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: vw(8),
  },
});

