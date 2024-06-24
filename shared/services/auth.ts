import { User } from '@prisma/client';
import { axiosInstance } from './instance';

export const getMe = async () => {
  const { data } = await axiosInstance.get<User>('/auth/me');

  return data;
};
