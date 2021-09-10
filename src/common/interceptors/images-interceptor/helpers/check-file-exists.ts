import { promisify } from "util";
import * as fs from 'fs';
import { join } from "path";


const isFileExists = promisify(fs.exists);

function getImgFileNameFromURL(imgUrl: string) {
    return imgUrl.substring(imgUrl.lastIndexOf('/') + 1);
  }

export async function isExistedImg(imgUrl: string, uploadDirPath: string) {
    return await isFileExists(
      join(uploadDirPath, getImgFileNameFromURL(imgUrl)),
    );
  }
  