import { PermissionsAndroid, Platform } from 'react-native';
import RNFS from 'react-native-fs';
import Toast from 'react-native-toast-message';
type ellipsizeMode = 'head' | 'middle' | 'tail' | 'clip';
export const nFixedLines = (
  numberOfLines: number = 1,
  ellipsizeMode: ellipsizeMode = 'tail',
) => ({
  numberOfLines,
  ellipsizeMode,
});

export function isNullUndefined(item: any, check: boolean = false): boolean {
  // Return early for null or undefined
  if (item === null || item === undefined) {
    return true;
  }

  // Check for string representations
  if (
    item === 'undef' ||
    item === 'undefined' ||
    item === 'null' ||
    item === ''
  ) {
    return true;
  }

  // Safely check for empty array or string length
  if (typeof item === 'string' || Array.isArray(item)) {
    return item.length === 0;
  }

  // Safely check for empty object
  if (typeof item === 'object' && item !== null) {
    return Object.keys(item).length === 0;
  }

  return false;
}

export const removeEmojis = (str: string) => {
  const regex =
    /(\u00a9|\u00ae|[\u2000-\u3300]|\ud83c[\ud000-\udfff]|\ud83d[\ud000-\udfff]|\ud83e[\ud000-\udfff])/g;
  return str.replace(regex, '');
};
export const normalizeSpaces = (value: string) => {
  return value.replace('  ', ' ');
};
export const normalizeFirstSpace = (value: string) => {
  return value.replace(/^\s+/g, '');
};
export const removeAlphabet = (value: string) => {
  return value.replace(/\D/g, '');
};
export const normalizeNumber = (value: string) => {
  return value.replace(/\D/g, '');
};
export const normalizeLetters = (value: string) => {
  return value.replace(/[^a-zA-Z\s\u0900-\u097F]/g, '').replace(/Z\u0900/g, ''); // This will remove non-letter characters except 'Z\u0900'
};
export const normalizeLettersAndNumbers = (value: string) => {
  return value.replace(/[^a-zA-Z0-9]/g, '');
};

export const otpRegex = (value: string) => {
  return value.replace(/[- #*;,.<>{}[\]\\/]/gi, '');
};

export const isIOS = Platform.OS === 'ios';
export const isAndroid = Platform.OS === 'android';

export const passwordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+])[A-Za-z\d!@#$%^&*()_+]{6,}$/;

export const titleCase = (str: any) => {
  let splitStr = str.toLowerCase().split(' ');
  for (let i = 0; i < splitStr.length; i++) {
    splitStr[i] =
      splitStr[i].charAt(0).toUpperCase() + splitStr[i].substring(1);
  }
  return splitStr.join(' ');
};

export const gstNumRegex = /^\d{2}[A-Z]{5}\d{4}[A-Z][A-Z\d]Z[A-Z\d]$/;

export const pinCodeRegex = /^[1-9]\d{5}$/;

// export const aadharCardRegex = /^[2-9]\d{3}\s\d{4}\s\d{4}$/;(XXXX XXXX XXXX)
export const aadharCardRegex = /^[2-9]\d{11}$/;
export const mobileRegex = /^[6-9]\d{9}$/;
export const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
export const panCardRegex = /^[A-Z]{5}\d{4}[A-Z]$/;

export const formatDate = (isoString: string): string => {
  const date = new Date(isoString);

  const pad = (n: number) => (n < 10 ? '0' + n : n);

  const day = pad(date.getDate());
  const month = pad(date.getMonth() + 1); // Month is 0-indexed
  const year = date.getFullYear().toString().slice(-2);

  let hours = date.getHours();
  const minutes = pad(date.getMinutes());
  const seconds = pad(date.getSeconds());

  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours || 12;
  const formattedHour = pad(hours);

  return `${day}/${month}/${year} ${formattedHour}:${minutes}:${seconds} ${ampm}`;
};

export const downloadAndOpenFile = async (fileUrl: string) => {
  try {
    // if (Platform.OS === 'android') {
    //   const permission =
    //     Platform.Version >= 33
    //       ? PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES
    //       : PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE;

    //   const granted = await PermissionsAndroid.request(permission, {
    //     title: 'Storage Permission Required',
    //     message: 'We need access to save the file',
    //     buttonPositive: 'OK',
    //     buttonNegative: 'Cancel',
    //   });

    //   if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
    //     return;
    //   }
    // }

    const fileName = fileUrl.split('/').pop();
    const downloadDir =
      Platform.OS === 'android'
        ? RNFS.DownloadDirectoryPath
        : RNFS.DocumentDirectoryPath;

    const localFile = `${downloadDir}/${fileName}`;

    await RNFS.downloadFile({
      fromUrl: fileUrl,
      toFile: localFile,
    }).promise;

    Toast.show({
      type: 'success',
      text2: 'File downloaded successfully',
    });
  } catch (err) {
    Toast.show({ type: 'error', text2: 'Download failed' });
  }
};
