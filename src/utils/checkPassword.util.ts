import argon2 from 'argon2';

const checkPassword = async (password: string, hashedPassword: string) => {
  return await argon2.verify(hashedPassword, password);
};

export default checkPassword;
