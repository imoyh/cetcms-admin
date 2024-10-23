export const AppConfiguration = {
  port: parseInt(process.env.PORT, 10) || 3325,
  host: process.env.HOST,
  environment: process.env.NODE_ENV || 'development',
  jwt: {
    secret: process.env.APP_SECRET || 'CETCMS_SECRET_3325',
    expiresIn: '1h',
  },
};
