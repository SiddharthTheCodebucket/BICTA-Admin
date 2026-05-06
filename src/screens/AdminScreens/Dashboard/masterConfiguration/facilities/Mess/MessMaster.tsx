import React, { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../../../../../../constants';
import SubTab from '../../../../../../components/molecules/SubTab';

import MessTopicList from './MessTopicList';
import MessMasterList from './MessMasterList';

interface Props {
  navigation: any;
}

type MessSubTab = 'messMaster' | 'messTopic';

const MessMaster = ({ navigation }: Props) => {
  const [activeTab, setActiveTab] = useState<MessSubTab>('messMaster');

  const subTabs = useMemo(
    () => [
      { label: 'Mess Master', value: 'messMaster' },
      { label: 'Mess Topic', value: 'messTopic' },
    ],
    [],
  );

  return (
    <SafeAreaView edges={['bottom']} style={styles.container}>
      <SubTab
        tabs={subTabs}
        activeTab={activeTab}
        onTabChange={value => setActiveTab(value as MessSubTab)}
      />
      <View style={styles.content}>
        {activeTab === 'messMaster' ? (
          <MessMasterList navigation={navigation} />
        ) : (
          <MessTopicList navigation={navigation} />
        )}
      </View>
    </SafeAreaView>
  );
};

export default MessMaster;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.new_ui_screen_bg,
  },
  content: {
    flex: 1,
  },
});
