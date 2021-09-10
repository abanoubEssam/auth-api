import {
  BadRequestException,
  CallHandler,
  ExecutionContext,
  ForbiddenException,
  mixin,
  NestInterceptor,
  Type,
  UnprocessableEntityException
} from '@nestjs/common';
import * as config from 'config';
import * as fs from 'fs';
import * as imageType from 'image-type';
import * as _ from 'lodash';
import * as makeDir from 'make-dir';
import * as multer from 'multer';
import * as path from 'path';
import { join } from 'path';
import { Observable } from 'rxjs';
import * as sharp from 'sharp';
import { promisify } from 'util';
import { v4 as uuidv4 } from 'uuid';
import { isExistedImg } from './images-interceptor/helpers/check-file-exists';
import { isImgUrl } from './images-interceptor/helpers/check-img-url';
import { ResizeOptions, UploadField } from './images-interceptor/interfaces/image-interceptor.interface';


// Convert Local Upload To Full Url
export async function toImgUrl(multerObject: any, appUrl: string) {
  return `${appUrl}/${multerObject.destination}/${multerObject.filename}`;
}

export function HandleImagesInterceptor(
  uploadFields: UploadField[],
): Type<NestInterceptor> {
  class MixinInterceptor implements NestInterceptor {
    async intercept(
      context: ExecutionContext,
      next: CallHandler,
    ): Promise<Observable<any>> {
      const ctx = context.switchToHttp(),
        req = ctx.getRequest();

      req.appUrl = `${req.protocol}://${config.get("server.baseUrl")}`


      await new Promise<void>((resolve, reject) =>
        handleImgsFieldsMiddleware(uploadFields)(
          ctx.getRequest(),
          ctx.getResponse(),
          (err: any) => {
            if (err) return reject(err);
            resolve();
          },
        ),
      );
      return next.handle();
    }
  }
  return mixin(MixinInterceptor) as Type<NestInterceptor>;
}



const supportedExtensions = ['jpg', 'jpeg', 'png', 'bmp', 'tif'];
const supportExtensionsAsString = supportedExtensions
  .map((ext) => `.${ext}|`)
  .join('')
  .slice(0, -1);
const filetypeExtensionRegex = new RegExp(`(?:${supportExtensionsAsString})`);
const writeFile = promisify(fs.writeFile);
const dest: string = 'uploads';

export const uploadsDirPath = join(process.cwd() , dest)

const multerUpload = multer({
  storage: multer.memoryStorage(),
  // limits: { fileSize: 1024 * 1024 * 12 }, // limit 12mb
});

function getExtensionFromBuffer(buffer: Buffer) {
  const { ext }: any = imageType(buffer);
  return supportedExtensions.includes(ext) ? ext : null;
}

export const getFullName = (extension: string) => uuidv4() + '.' + extension;

async function handleMulterObjectToImgUrl(multerObject: any, appUrl: string) {
  let validExtension = getExtensionFromBuffer(multerObject.buffer);
  if (!validExtension)
    throw new BadRequestException({
      message: 'File Type is Not Supported',
      param: multerObject.filename,
    });

  let filename = multerObject.filename || getFullName(validExtension);

  await makeDir(uploadsDirPath);
  await writeFile(
    `${uploadsDirPath}/` + filename,
    multerObject.buffer,
    'binary',
  );

  multerObject.filename = filename;
  multerObject.destination = dest;

  return toImgUrl(multerObject, appUrl);
}

async function checkValidImgUrl(req: Request, field: UploadField) {
  const fieldDataInBody = _.castArray(req.body[field.name]);

  for (let imgUrl of fieldDataInBody) {
    if (
      (!isImgUrl(imgUrl) || !(await isExistedImg(imgUrl, uploadsDirPath))) &&
      !field.allowNullUrl
    )
      throw new UnprocessableEntityException({
        param: field.name,
        message: 'invalid img url',
      });
  }
}

function handleStringifiedField(req: any, field: UploadField) {
  if (field.maxCount > 1) {
    if (!Array.isArray(req.body[field.name])) {
      try {
        req.body[field.name] = JSON.parse(req.body[field.name]);
      } catch (err) {
        // Couldn't Parse but That's Okey
      }

      req.body[field.name] = _.castArray(req.body[field.name]);
    }
  }
}

/**
 * validate and handle stringified fields
 * @param {*} req
 * @param {*} fields
 * @param {*} options
 */
async function validateAndNormalizeImg(
  req: any,
  field: UploadField,
  options = {},
) {
  // validate fields
  if (field.ignore) return;

  // check if all required fields are existed
  if (
    !field.optional &&
    (!req.files[field.name] || (field.isAllowedUrl && !req.body[field.name]))
  )
    throw new UnprocessableEntityException({
      param: field.name,
      message: 'general.requiredImage.error',
      isI18nMessage: true,
    });

  // check if it's allowed to be an img url
  if (!field.isAllowedUrl && req.body[field.name] && !field.allowNullUrl) {
    throw new ForbiddenException('you are not allowed to add an image url');
  }

  // parse the field if it's stringified and validate url
  if (req.body[field.name]) {
    handleStringifiedField(req, field);
    await checkValidImgUrl(req, field);
  }
}

type handleIncomingRawImgsObjectAndKeepExistingOnesOptions = {
  collectionOfResizeOptions?: ResizeOptions[];
};

/**
 * Handle Img as a multer object OR imgURL
 * @param {*} req
 * @param {*} fields
 */
async function handleIncomingRawImgsObjectAndKeepExistingOnes(
  req: any,
  field: UploadField,
  options = {
    collectionOfResizeOptions: [],
  } as handleIncomingRawImgsObjectAndKeepExistingOnesOptions,
) {
  // Handle Imgs In Body
  if (req.body[field.name]) {
    // upload an array of images
    if (field.maxCount > 1) {
      req.body[field.name] = req.body[field.name] || [];

      if (
        options.collectionOfResizeOptions &&
        options.collectionOfResizeOptions.length > 0
      ) {
        let resizedFieldInBody: any = [];
        for (let imgUrl of req.body[field.name]) {
          let resizedImgUrl = { original: imgUrl };
          options.collectionOfResizeOptions.forEach((resizeOptions) => {
            const imgUrlWithoutExtension = imgUrl.split(filetypeExtensionRegex),
              fileNamePrefix = imgUrl.substring(imgUrl.lastIndexOf('.') + 1);

            resizedImgUrl[fileNamePrefix] =
              imgUrlWithoutExtension[0] +
              '_' +
              resizeOptions.extraFileNamePostfix;
          });

          resizedFieldInBody.push(resizedImgUrl);
        }

        req.body[field.name] = resizedFieldInBody;
      }
    } else {
      // upload single image
      let imgUrl = req.body[field.name];
      if (
        imgUrl !== 'NULL' &&
        options.collectionOfResizeOptions &&
        options.collectionOfResizeOptions.length > 0
      ) {
        let resizedImgUrl = { original: imgUrl };
        options.collectionOfResizeOptions.forEach((resizeOptions: any) => {
          const imgUrlSplitted = imgUrl.split(filetypeExtensionRegex);
          const fileNamePrefix = resizeOptions
            ? resizeOptions.extraFileNamePostfix.match(/.+?(?=\.)/).toString()
            : '';
          resizedImgUrl[
            fileNamePrefix
          ] = `${imgUrlSplitted[0]}_${resizeOptions.extraFileNamePostfix}`;
        });

        imgUrl = resizedImgUrl;
      }

      req.body[field.name] = imgUrl;
    }
  }

  // Handle Uploaded Files
  if (req.files[field.name]) {
    // upload an array of images
    if (field.maxCount > 1) {
      req.body[field.name] = req.body[field.name] || [];

      for (let imgAsMulterObject of req.files[field.name]) {
        let imgUrl: any = await handleMulterObjectToImgUrl(
          imgAsMulterObject,
          req.appUrl,
        );

        if (
          options.collectionOfResizeOptions &&
          options.collectionOfResizeOptions.length > 0
        ) {
          imgUrl = { original: imgUrl };

          for (let resizeOptions of options.collectionOfResizeOptions) {
            const fileNamePrefix = (resizeOptions as any).extraFileNamePostfix
              .match(/.+?(?=\.)/)
              .toString();
            imgUrl[fileNamePrefix] = await resizeImg(
              imgAsMulterObject,
              resizeOptions,
              req.appUrl,
            );
          }
        }

        req.body[field.name].push(imgUrl);
      }
    } else {
      // upload single image
      const imgAsMulterObject = req.files[field.name][0];

      let imgUrl: any = await handleMulterObjectToImgUrl(
        imgAsMulterObject,
        req.appUrl,
      );

      if (
        options.collectionOfResizeOptions &&
        options.collectionOfResizeOptions.length > 0
      ) {
        imgUrl = { original: imgUrl };

        for (let resizeOptions of options.collectionOfResizeOptions) {
          const fileNamePrefix = (resizeOptions as any).extraFileNamePostfix
            .match(/.+?(?=\.)/)
            .toString();
          imgUrl[fileNamePrefix] = await resizeImg(
            imgAsMulterObject,
            resizeOptions,
            req.appUrl,
          );
        }
      }

      req.body[field.name] = imgUrl;
    }
  }
}





const collectionOfDefaultResizeOptions = {
  thumbnail: {
    extraFileNamePostfix: 'thumbnail.jpg',
    useOverlay: false,
    // width: 0.4,
    // height: 0.4,
    relativeResize: true,
    format: sharp.format.jpeg,
    jpegQuality: 100,
  },
  medium: {
    extraFileNamePostfix: 'medium.jpg',
    useOverlay: false,
    width: 400,
    height: 200,
    relativeResize: false,
    format: sharp.format.jpeg,
    jpegQuality: 100,
  },
};

/**
 * @param {Array.<{name: String, maxCount: Number, optional: Boolean, isAllowedUrl: Boolean, ignore: Boolean}>} fields
 */
export const handleImgsFieldsMiddleware = (fields: UploadField[]) => {
  return async (req, res, next) => {
    req.files = req.files || {};

    try {
      let handleImgsOperations: any = [];

      for (let field of fields) {
        // validate and handle stringified fields
        await validateAndNormalizeImg(req, field);

        let collectionOfResizeOptions: ResizeOptions[] = [];
        if (field.resizeOptions) {
          Object.keys(field.resizeOptions).forEach((key) => {
            const defaultResizeOptions = collectionOfDefaultResizeOptions[key];
            if (!defaultResizeOptions)
              throw new Error(
                'Invalid ResizeOptions Data For Field Name : ' + field.name,
              );

            collectionOfResizeOptions.push(defaultResizeOptions);
          });
        }

        // defer converting img path to a valid url or update existing one
        handleImgsOperations.push(() =>
          handleIncomingRawImgsObjectAndKeepExistingOnes(req, field, {
            collectionOfResizeOptions,
          }),
        );
      }

      await Promise.all(handleImgsOperations.map((operation) => operation()));

      next();
    } catch (err) {
      next(err);
    }
  };
};

async function resizeImg(imgAsMulterObject, resizeOptions, appUrl) {
  const {
    extraFileNamePostfix,
    useOverlay,
    width,
    height,
    format,
    relativeResize,
    jpegQuality,
  }: any = {
    extraFileNamePostfix: 'thumbnail.png',
    useOverlay: true,
    width: 128,
    height: 128,
    format: sharp.format.png,
    relativeResize: false,
    ...resizeOptions,
  };

  // convert all images to png to be sure it has transparency
  let resizedFileName = `${imgAsMulterObject.filename.split('.')[0]
    }_${extraFileNamePostfix}`;

  let fullRadius = 128,
    radius = fullRadius / 2,
    circleSvg = `<svg width="${fullRadius}" height="${fullRadius}"><circle cx="${radius}" cy="${radius}" r="${radius}"/></svg>`;

  let sharpObj = await sharp(imgAsMulterObject.buffer);

  if (relativeResize) {
    const imageMetadata: any = await sharpObj.metadata();
    if (imageMetadata.width > 128 || imageMetadata.height > 128) {
      sharpObj = sharpObj.resize(128, 128);
    }
    // sharpObj = sharpObj.resize(Math.floor(imageMetadata.width * width), Math.floor(imageMetadata.height * height));
  }
  // else {
  // 	sharpObj = sharpObj.resize(width, height);
  // }

  // TODO : Should Be Tested
  // use composite instead of overlayWith which has been deprecated.
  if (useOverlay)
    sharpObj = sharpObj.composite([
      {
        input: Buffer.from(circleSvg),
      },
    ]);

  sharpObj = sharpObj.toFormat(format);

  if (jpegQuality) sharpObj = sharpObj.jpeg({ quality: jpegQuality });

  sharpObj.toFile(`${dest}/${resizedFileName}`);

  return toImgUrl({ destination: dest, filename: resizedFileName }, appUrl);
}
