import React from 'react';
import {
  ImageBackground,
  StyleProp,
  StyleSheet,
  TextStyle,
  View,
  ViewStyle,
} from 'react-native';
import {
  adminFontSizes,
  colors,
  fonts,
  images,
  SvgFilterLines,
  SvgSearch,
  vh,
  vw,
} from '../../constants';
import { globalStyles } from '../../utils/globalStyles';
import TextAtom from '../atoms/TextAtom';
import TouchableAtom from '../atoms/TouchableAtom';

export type AdminListHeaderIconActionConfig = {
  visible?: boolean;
  onPress?: () => void;
  icon?: React.ReactNode;
  accessibilityLabel?: string;
  testID?: string;
};

export type AdminListHeaderCreateConfig = {
  visible?: boolean;
  onPress?: () => void;
  label?: string;
  accessibilityLabel?: string;
  testID?: string;
  renderButton?: (args: { label: string }) => React.ReactNode;
};

export type AdminListHeaderConfig = {
  title: string;
  count?: number | string;
  showCount?: boolean;
  search?: AdminListHeaderIconActionConfig;
  filter?: AdminListHeaderIconActionConfig;
  create?: AdminListHeaderCreateConfig;
};

type Props = {
  config: AdminListHeaderConfig;
  containerStyle?: StyleProp<ViewStyle>;
  titleRowStyle?: StyleProp<ViewStyle>;
  titleStyle?: StyleProp<TextStyle>;
  countStyle?: StyleProp<TextStyle>;
  actionsRowStyle?: StyleProp<ViewStyle>;
  iconButtonStyle?: StyleProp<ViewStyle>;
  createTouchableStyle?: StyleProp<ViewStyle>;
  createTextStyle?: StyleProp<TextStyle>;
};

const AdminListHeader = ({
  config,
  containerStyle,
  titleRowStyle,
  titleStyle,
  countStyle,
  actionsRowStyle,
  iconButtonStyle,
  createTouchableStyle,
  createTextStyle,
}: Props) => {
  const showCount =
    config.showCount ?? (config.count !== undefined && config.count !== null);

  const searchOnPress = config.search?.onPress;
  const filterOnPress = config.filter?.onPress;
  const createOnPress = config.create?.onPress;
  const hasCustomCreateButton =
    typeof config.create?.renderButton === 'function';

  const showSearch =
    !!config.search?.visible && typeof searchOnPress === 'function';
  const showFilter =
    !!config.filter?.visible && typeof filterOnPress === 'function';
  const showCreate =
    !!config.create?.visible &&
    (hasCustomCreateButton || typeof createOnPress === 'function');

  return (
    <View style={[styles.headerRow, containerStyle]}>
      <View style={[styles.titleRow, titleRowStyle]}>
        <TextAtom numberOfLines={2} style={[styles.headerTitle, titleStyle]}>
          {config.title}
        </TextAtom>
        {showCount && (
          <TextAtom style={[styles.headerCount, countStyle]}>
            ({config.count ?? 0})
          </TextAtom>
        )}
      </View>

      <View style={[styles.actionsRow, actionsRowStyle]}>
        {showSearch && (
          <TouchableAtom
            testID={config.search?.testID}
            accessibilityLabel={config.search?.accessibilityLabel}
            style={[styles.iconBtn, iconButtonStyle]}
            onPress={searchOnPress!}
          >
            {config.search?.icon ?? (
              <SvgSearch width={vw(18)} height={vw(18)} />
            )}
          </TouchableAtom>
        )}

        {showFilter && (
          <TouchableAtom
            testID={config.filter?.testID}
            accessibilityLabel={config.filter?.accessibilityLabel}
            style={[styles.iconBtn, iconButtonStyle]}
            onPress={filterOnPress!}
          >
            {config.filter?.icon ?? (
              <SvgFilterLines width={vw(18)} height={vw(18)} />
            )}
          </TouchableAtom>
        )}

        {showCreate && (
          <View>
            {hasCustomCreateButton ? (
              config.create?.renderButton?.({
                label: config.create?.label ?? '+ Create',
              })
            ) : typeof createOnPress === 'function' ? (
              <TouchableAtom
                testID={config.create?.testID}
                accessibilityLabel={config.create?.accessibilityLabel}
                style={[
                  globalStyles.createButtonTouchable,
                  createTouchableStyle,
                ]}
                onPress={createOnPress}
              >
                <ImageBackground
                  source={images.buttonGrad_25}
                  style={globalStyles.createButton}
                  imageStyle={globalStyles.createButtonImage}
                  resizeMode="stretch"
                >
                  <TextAtom
                    style={[globalStyles.createButtonText, createTextStyle]}
                  >
                    {config.create?.label ?? '+ Create'}
                  </TextAtom>
                </ImageBackground>
              </TouchableAtom>
            ) : null}
          </View>
        )}
      </View>
    </View>
  );
};

export default AdminListHeader;

const styles = StyleSheet.create({
  headerRow: {
    marginTop: vh(10),
    // paddingHorizontal: vw(14),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    flexShrink: 1,
  },
  headerTitle: {
    flexShrink: 1,
    fontFamily: fonts.Inter_Bold,
    fontSize: adminFontSizes.md,
    color: colors.new_ui_heading,
  },
  headerCount: {
    marginLeft: vw(4),
    fontFamily: fonts.Inter_Regular,
    fontSize: adminFontSizes.sm,
    color: colors.new_ui_count,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: vw(8),
    marginLeft: vw(10),
  },
  iconBtn: {
    width: vw(22),
    height: vw(22),
    alignItems: 'center',
    justifyContent: 'center',
  },
});
