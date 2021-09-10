import { Schema } from "mongoose";
import { AppRoles } from "src/common/constants";
import { getDefaultUserImageUrl, getDefaultUserThumbnailImageUrl } from "src/common/utils/defaultImages";

export const UserSchema: Schema = new Schema({
    firstName: {
        type: String,
        trim: true,
        required: true
    },
    lastName: {
        type: String,
        trim: true,
        required: true
    },
    email: {
        type: String,
        lowercase: true,
        trim: true,
        sparse: true,
        index: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    profileImg: {
        original: {
            type: String,
            required: true,
            default: getDefaultUserImageUrl()
        },
        thumbnail: {
            type: String,
            required: true,
            default: getDefaultUserThumbnailImageUrl()
        }
    },
    role: {
        type: String,
        enum : [AppRoles.USER,AppRoles.ADMIN],
        default: AppRoles.USER
    },
    verified: {
        type: Boolean,
        default: false,
    }
}, { timestamps: true });



UserSchema.set('toJSON', {
    transform: (doc, ret, options) => {
        ret.id = ret._id;
        // delete ret.password
        delete ret._id;
        delete ret.__v;
        return ret;
    },
});
