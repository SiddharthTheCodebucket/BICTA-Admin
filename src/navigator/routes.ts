import { StackActions, CommonActions } from '@react-navigation/native';

/*
  Router only generates navigation actions (plain js objects).
  The actual navigation is done using the Navigator ref, by dispatching those actions.
*/
type ScreenType = 'OnBoardingNavigator' | 'BottomTabNavigator';

const Router = {
  goTo: (navigation: any, routeName: ScreenType, params?: any) =>
    navigation.dispatch(
      CommonActions.navigate({
        name: routeName,
        params,
      }),
    ),

  resetNew: (navigation: any, routeName: ScreenType, params?: any) =>
    navigation.dispatch(
      CommonActions.reset({
        index: 1,
        routes: [{ name: routeName, params }],
      }),
    ),
  pop: (n = 1) => StackActions.pop(n),
};

export default Router;
