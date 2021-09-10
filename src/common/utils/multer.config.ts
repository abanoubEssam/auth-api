import { diskStorage } from "multer";
import { join } from "path";
import { v4 as uuidv4 } from 'uuid';
import * as config from 'config';

export const storage = diskStorage({
    destination: join(process.cwd(), 'uploads'),
    filename: (req, file, callback) => {
        try {
            const generatedFileName = generateFilename(file)
            if (file && file.fieldname) {
                req.body[file.fieldname] = {
                    original: `${req.protocol}://${config.get("server.baseUrl")}/uploads/${generatedFileName}`,
                    thumbnail: `${req.protocol}://${config.get("server.baseUrl")}/uploads/${generatedFileName}`
                }
            }
            callback(null, generatedFileName);

        } catch (error) {
            console.log("🚀 ~ file: multer.config.ts ~ line 19 ~ error", error)
        }
    },
});

function generateFilename(file) {
    return `${uuidv4()}-${file.originalname}`;
}