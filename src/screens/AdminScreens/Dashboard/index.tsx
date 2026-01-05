import React, { useEffect, useLayoutEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, fonts, images, vw, vh } from '../../../constants';
import strings from '../../../constants/strings';
import {
  Header,
  NavigationType,
} from '../../../components/organisms/HeaderOrganism';
import FullscreenLoading from '../../../components/organisms/FullscreenLoading';
import TouchableAtom from '../../../components/atoms/TouchableAtom';
import TextAtom from '../../../components/atoms/TextAtom';
import DropDownOrganism from '../../../components/organisms/DropDownOrganism';
import ViewAtom from '../../../components/atoms/ViewAtom';

import HostelPlanning from './Hostel/HostelPlanning';
import HostelReport from './Hostel/HostelReport';
import AllHostel from './Hostel/AllHostel';
import Vendor from './Vendor';
import { useAppSelector } from '../../../hooks';

interface Props {
  route: any;
  navigation: NavigationType;
}

const HOSTEL_INNER_TABS = [
  strings.dashboardIndex.hostelPlanning,
  strings.dashboardIndex.hostelReport,
  strings.dashboardIndex.allHostel,
];

const Dashboard = (props: Props) => {
  const { navigation } = props;

  const { crediantialData } = useAppSelector(state => state.Auth);
  const [time, setTime] = useState(new Date());
  const [loader, setLoader] = useState(false);

  const [activeTab, setActiveTab] = useState<'Hostel' | 'Vendor'>('Hostel');
  const [innerTab, setInnerTab] = useState('Hostel Planning');
  const [centerSerach, setCenterSerach] = useState<any>({});

  const HostelTabs: any = {
    [strings.dashboardIndex.hostelPlanning]: HostelPlanning,
    [strings.dashboardIndex.hostelReport]: HostelReport,
    [strings.dashboardIndex.allHostel]: AllHostel,
  };

  const VendorTabs: any = {
    Default: Vendor,
  };
  const ActiveComponent =
    activeTab === 'Hostel' ? HostelTabs[innerTab] : Vendor;

  useLayoutEffect(() => {
    Header.setDashboardHeader(navigation, { time, logo: images.logo });
  }, [time]);

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);
  useEffect(() => {
    if (props.route?.params?.goToHostelPlanning) {
      setActiveTab('Hostel');
      setInnerTab(strings.dashboardIndex.hostelPlanning);
    }
  }, [props.route?.params]);
  return (
    <View style={styles.container}>
      <FullscreenLoading isVisible={loader} />

      <View style={styles.tabRow}>
        {[
          strings.dashboardIndex.hostel,
          crediantialData.user[0].tenantId === 3 &&
            strings.dashboardIndex.vendor,
        ]
          .filter(Boolean)
          .map((tab, index) => (
            <TouchableAtom
              key={index.toString() + tab}
              style={[styles.tabButton, activeTab === tab && styles.activeTab]}
              onPress={() => {
                setActiveTab(tab as any);
                setInnerTab('Hostel Planning');
              }}
            >
              <TextAtom
                style={[
                  styles.tabText,
                  activeTab === tab && styles.activeTabText,
                ]}
              >
                {tab}
              </TextAtom>
            </TouchableAtom>
          ))}

        {activeTab === 'Hostel' && crediantialData.user[0].tenantId === 3 && (
          <DropDownOrganism
            label={''}
            placeholder={strings.dashboardIndex.centers}
            inputText={centerSerach?.name}
            onPress={() => {
              navigation.navigate('DropDownModal', {
                name: strings.dashboardIndex.center,
                Data: [
                  {
                    id: strings.dashboardIndex.allCenters,
                    name: strings.dashboardIndex.allCenters,
                  },
                  {
                    id: strings.dashboardIndex.gaya,
                    name: strings.dashboardIndex.gaya,
                  },
                  {
                    id: strings.dashboardIndex.patna,
                    name: strings.dashboardIndex.patna,
                  },
                ],
                selectedData: centerSerach,
                setSelectedData: setCenterSerach,
                typeName: 'name',
                typeId: 'id',
              });
            }}
            containerStyle={styles.centerContainer}
            contentContainerStyle={styles.centerContent}
            downArrowStyle={styles.centerDownArrow}
          />
        )}
      </View>

      <ViewAtom style={styles.separator} />

      <ViewAtom style={styles.innerRow}>
        {activeTab === 'Hostel' && (
          <ViewAtom style={styles.innerRow}>
            {HOSTEL_INNER_TABS.map(tab => (
              <TouchableAtom
                key={tab}
                style={[
                  styles.innerButton,
                  innerTab === tab && styles.innerActive,
                ]}
                onPress={() => setInnerTab(tab)}
              >
                <TextAtom
                  style={[
                    styles.innerText,
                    innerTab === tab && styles.innerActiveText,
                  ]}
                >
                  {tab}
                </TextAtom>
              </TouchableAtom>
            ))}
          </ViewAtom>
        )}
      </ViewAtom>

      <View style={styles.activeScreen}>
        <ActiveComponent
          navigation={navigation}
          selectedCenter={centerSerach?.id}
        />
      </View>
    </View>
  );
};

export default Dashboard;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundColor,
    paddingHorizontal: vw(15),
    paddingTop: vh(10),
  },
  tabRow: {
    flexDirection: 'row',
    width: vw(330),
    // marginTop: vh(5),
    alignItems: 'center',
    gap: vh(10),
  },
  tabButton: {
    width: vw(90),
    height: vh(35),
    backgroundColor: colors.lightGray2,
    borderRadius: vw(6),
    alignItems: 'center',
    justifyContent: 'center',
    // marginTop: vh(6),
  },
  activeTab: {
    backgroundColor: colors.primary,
  },
  tabText: {
    color: colors.black,
    fontFamily: fonts.Roboto_Medium,
    fontSize: vw(14),
  },
  activeTabText: {
    color: colors.white,
  },
  centerContainer: {
    width: vw(125),
    height: vh(35),
  },
  centerContent: {
    width: vw(125),
    height: vh(35),
    marginTop: vh(5),
  },
  centerDownArrow: {
    marginLeft: vh(-300),
  },
  separator: {
    width: '100%',
    height: vh(1),
    backgroundColor: colors.chinese_silver,
    marginTop: vh(8),
  },
  innerRow: {
    flexDirection: 'row',
    marginTop: vh(5),
    gap: vw(10),
  },
  innerButton: {
    paddingVertical: vh(8),
    paddingHorizontal: vw(12),
    backgroundColor: colors.lightGray2,
    borderRadius: vw(6),
  },
  innerActive: {
    backgroundColor: colors.primary,
  },
  innerText: {
    color: colors.black,
    fontSize: vw(13),
    fontFamily: fonts.Roboto_Medium,
  },
  innerActiveText: {
    color: colors.white,
    fontSize: vw(13),
    fontFamily: fonts.Roboto_Medium,
  },
  activeScreen: {
    flex: 1,
    paddingTop: vh(10),
  },
});
