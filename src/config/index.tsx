import env from 'react-native-config';

const config = {
  base_url: {
    BASE_URL: env.BASE_URL,
  },
};

const BASE_URL = config.base_url.BASE_URL;
export { BASE_URL };

export default config;
