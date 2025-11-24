import {Dimensions, PixelRatio} from 'react-native';
export const SCREEN_WIDTH = Dimensions.get('window').width;
export const SCREEN_HEIGHT = Dimensions.get('window').height;
export const DesignHeight = 778;
export const DesignWidth = 360;

// It is based on the screen width of your design layouts e.g Height 600 x Width 375
const scale = SCREEN_WIDTH / 375;

export function normalize(size: any) {
  return PixelRatio.roundToNearestPixel(size * scale);
}

export const vw = (width: number) => {
  let percent = (width / DesignWidth) * 100;
  const elemWidth = parseFloat(percent + '%');
  return PixelRatio.roundToNearestPixel((SCREEN_WIDTH * elemWidth) / 100);
};

export const vh = (height: number) => {
  let percent = (height / DesignHeight) * 100;
  const elemHeight = parseFloat(percent + '%');
  return PixelRatio.roundToNearestPixel((SCREEN_HEIGHT * elemHeight) / 100);
};

export default {
  vh,
  vw,
  SCREEN_WIDTH,
  SCREEN_HEIGHT,
};
