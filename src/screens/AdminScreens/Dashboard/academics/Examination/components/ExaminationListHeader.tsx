import React, { useMemo } from 'react';
import { StyleSheet } from 'react-native';
import AdminListHeader, {
  AdminListHeaderConfig,
} from '../../../../../../components/organisms/AdminListHeader';

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
  const headerConfig = useMemo<AdminListHeaderConfig>(
    () => ({
      title,
      count,
      showCount: typeof count === 'number',
      search: {
        visible: !!onPressSearch,
        onPress: onPressSearch,
      },
      create: {
        visible: !!onPressCreate,
        onPress: onPressCreate,
        label: createLabel,
      },
    }),
    [count, createLabel, onPressCreate, onPressSearch, title],
  );

  return (
    <AdminListHeader
      config={headerConfig}
      containerStyle={styles.headerRow}
    />
  );
};

export default ExaminationListHeader;

const styles = StyleSheet.create({
  headerRow: {
    paddingHorizontal: 0,
  },
});
