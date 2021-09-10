import * as config from 'config';

export function getDefaultUserImageUrl() {
  let imgurl: string = `://${config.get('server.baseUrl')}/assets/default-images/anonymous.png`;
  if (process.env.NODE_ENV == 'production') {
    imgurl = `https` + imgurl;
  } else {
    imgurl = "http" + imgurl;
  }
  return imgurl;
}

export function getDefaultUserThumbnailImageUrl() {
  let imgurl: string = `://${config.get('server.baseUrl')}/assets/default-images/anonymous_thumbnail.png`;
  if (process.env.NODE_ENV == 'production') {
    imgurl = "https" + imgurl
  } else {
    imgurl = "http" + imgurl;
  }
  return imgurl;
}

