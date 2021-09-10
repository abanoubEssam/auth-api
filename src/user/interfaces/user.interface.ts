import { Document } from 'mongoose';
import { ProfileImg } from './profile-image';

export interface UserModel extends Document {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    createdAt:Date;
    updatedAt:Date;
    profileImg:ProfileImg;
}
