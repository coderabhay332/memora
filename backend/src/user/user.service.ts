import mongoose from "mongoose";
import { type IUser } from "./user.dto";
import userSchema from "./user.schema";
import bcrypt from "bcrypt";
import { createUserTokens } from "../common/services/passport-jwt.services";
require('dotenv').config();
import jwt from "jsonwebtoken";
import { loadConfig } from "../common/helper/config.helper";

loadConfig();

export const generateRefreshToken = (id: string, role: string): string => {
    return jwt.sign({ id, role }, process.env.JWT_REFRESH_SECRET as string, { expiresIn: "7d" });
  };  




export const createUser = async (data: IUser) => {
  const result = await userSchema.create({ ...data, active: true });
  return result.toObject();
};

export const updateUser = async (id: string, data: IUser) => {
  const result = await userSchema.findOneAndUpdate({ _id: id }, data, {
    new: true,
  });
  return result;
};

export const me = async (user: IUser) => {
  console.log("user", user._id);
  if (!user || !user._id) {
    throw new Error('User not authenticated');
  }
  const result = await userSchema.findById(user._id).select('-password').lean();
  if (!result) {
    throw new Error('User not found');
  }
  return result;
};

export const editUser = async (id: string, data: Partial<IUser>) => {
  const result = await userSchema.findOneAndUpdate({ _id: id }, data);
  return result;
};

export const deleteUser = async (id: string) => {
  const result = await userSchema.deleteOne({ _id: id });
  return result;
};

export const getUserById = async (id: string) => {
  const result = await userSchema.findById(id).lean();
  return result;
};

export const getAllUser = async () => {
  const result = await userSchema.find({}).lean();
  return result;
};

export const login = async (email: string, password: string) => {
  const user = await userSchema.findOne({ email });
  if (!user) {
    throw new Error('User not found');
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw new Error('Invalid password');
  }
  const refreshToken = jwt.sign(
    { id: user._id },
    process.env.JWT_REFRESH_SECRET || 'your-refresh-secret',
    { expiresIn: '7d' }
  );
  user.refreshToken = refreshToken;
  await user.save();

  return user;
};

export const getUserByEmail = async (email: string, withPassword = false) => {
  if (withPassword) {
      const result = await userSchema.findOne({ email }).select('+password').lean();
      return result;
  }
};

export const updateUserToken = async (user: IUser, refreshToken: string) => {
  const result = await userSchema.findOneAndUpdate(
    { _id: user._id },
    { refreshToken },
    { new: true }
  );
  return result;
};

export const refreshToken = async (refreshToken: string) => {
  try {
    const user = await userSchema.findOne({ refreshToken: refreshToken });
    console.log("user", user);
    if (!user) {
      throw new Error("Invalid refresh token");
    }
    const tokens = createUserTokens(user as IUser)
    
    // Generate new tokens
    const newAccessToken = tokens.accessToken

    const newRefreshToken = tokens.refreshToken

    await userSchema.findByIdAndUpdate(user._id, { refreshToken: newRefreshToken });

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    };
  } catch (error) {
    throw new Error("Invalid refresh token");
  }
};


export const getAppByUserId = async (userId: string) => {
  const user = await userSchema.findById(userId).populate('apps').lean();
  if (!user) {
    throw new Error('User not found');
  }
  return user;
};
