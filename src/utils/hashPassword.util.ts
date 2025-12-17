import argon2 from 'argon2';

const hashPassword = async (password: string) => {
  return await argon2.hash(password);
};

export default hashPassword;
