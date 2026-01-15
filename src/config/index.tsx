import env from 'react-native-config';

const config = {
  base_url: {
    BASE_URL: env.BASE_URL,
    BASE_URL_COPY_LINK: env.BASE_URL_COPY_LINK,
  },
};

const BASE_URL = config.base_url.BASE_URL;
const BASE_URL_COPY_LINK = config.base_url.BASE_URL_COPY_LINK;
export { BASE_URL, BASE_URL_COPY_LINK };

export default config;
