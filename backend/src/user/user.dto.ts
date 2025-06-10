import { BaseSchema } from "../common/dto/base.dto";

export interface IUser extends BaseSchema {
    email: string;
    password: string;
    role: string;
    name: string;
    refreshToken: string;
}
