import { MulterField } from "@nestjs/platform-express/multer/interfaces/multer-options.interface";

export type UploadField = MulterField & {
    maxCount: number;
    optional?: boolean;
    isAllowedUrl?: boolean;
    allowNullUrl?: boolean;
    ignore?: boolean;
    placeholder?: boolean;
    resizeOptions?: {
      thumbnail?: boolean;
      medium?: boolean;
    };
  };


 export type ResizeOptions = {
    extraFileNamePostfix: string;
    useOverlay: boolean;
    width: number;
    height: number;
    relativeResize: boolean;
    format: string;
    jpegQuality: number;
  };