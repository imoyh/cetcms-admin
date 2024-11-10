export const AppConfiguration = {
  port: parseInt(process.env.PORT, 10) || 3325,
  host: process.env.HOST,
  environment: process.env.NODE_ENV || 'development',
  jwt: {
    secret: process.env.JWT_SECRET || 'CETCMS_SECRET_3325',
    expiresIn: process.env.JWT_EXPIRES_IN || '1h',
  },
};
