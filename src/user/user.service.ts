import { ConflictException, Injectable, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as config from 'config';
import { Model } from 'mongoose';
import { CreateUserDto } from 'src/auth/dtos/create-user.dto';
import { AppRoles, USER_MODEL_NAME } from 'src/common/constants';
import { hashPassword } from 'src/common/utils/hash-password';
import { generateAccessToken } from 'src/common/utils/jwt-generator';
import { VerifyUsersDto } from './dtos/verify-users.dto';
import { UserModel } from './interfaces/user.interface';

@Injectable()
export class UserService implements OnModuleInit {

    constructor(
        @InjectModel(USER_MODEL_NAME) private _userModel: Model<UserModel>,
    ) { }

    async onModuleInit() {
        await this.createAdmin()
    }

    async createUser(
        createUserDto: CreateUserDto
    ) {

        // check mail taken 
        const mailTaken = await this.checkMail(createUserDto.email)
        if (mailTaken) {
            throw new ConflictException({ message: "this email taken" });
        }
        const body: CreateUserDto = {
            ...createUserDto,
            password: await hashPassword(createUserDto.password)

        }
        const createdUser = await this._userModel.create(body);
        const findCreatedUser = await this._userModel.findOne({ email: createdUser.email }).select({ password: 0 });
        return {
            user: findCreatedUser,
            accessToken: generateAccessToken(findCreatedUser._id, AppRoles.USER)
        }
    }


    async findOne(query) {
        const user = await this._userModel.findOne(query)
        if (user) {
            return user.toJSON()
        }
        return user;
    }


    async find() {
        return await this._userModel.find({}).select({ password: 0 })
    }

    async verifyUser(
        verifyUsersDto: VerifyUsersDto
    ) {
        await this._userModel.updateMany({ _id: { $in: verifyUsersDto.userIds } }, { verified: true }, { new: true })
    }

    private async createAdmin() {
        const hashedPassword = await hashPassword(config.get("admin.password"))
        const admin = config.get("admin");
        const adminFound = await this._userModel.findOne({ email: admin.email })
        if (!adminFound) {
            await this._userModel.create({
                ...admin,
                password: hashedPassword,
                verified: true,
                role: AppRoles.ADMIN
            })
        }
    }

    private async checkMail(email: string) {
        const user = await this._userModel.findOne({ email })
        if (user) {
            return true
        }
        return false;
    }
}
