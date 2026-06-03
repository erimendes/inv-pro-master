import * as Joi from 'joi';

export const validationSchema = Joi.object({
  NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
  PORT: Joi.number().default(3000),
  DATABASE_URL: Joi.string().required(),
  GLPI_API_URL: Joi.string().uri().required(),
  GLPI_APP_TOKEN: Joi.string().required(),
  GLPI_USER_TOKEN: Joi.string().required(),
});
