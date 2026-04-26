/**
 * Environment variable validation utility
 */

const validateEnv = () => {
  const requiredEnvVars = {
    MONGO_URI: process.env.MONGO_URI,
    GEMINI_API_KEY: process.env.GEMINI_API_KEY,
    JWT_SECRET: process.env.JWT_SECRET,
    // Optional variables with defaults
    PORT: process.env.PORT || '5000',
    NODE_ENV: process.env.NODE_ENV || 'development',
  };

  const cloudinaryVars = {
    CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
    CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
    CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,
  };

  const missing = [];
  const warnings = [];

  // Check required vars
  Object.entries(requiredEnvVars).forEach(([key, value]) => {
    if (key !== 'PORT' && key !== 'NODE_ENV' && !value) {
      missing.push(key);
    }
  });

  // Check Cloudinary vars (used for image uploads)
  const cloudinaryConfigured = Object.values(cloudinaryVars).every((v) => v);
  if (!cloudinaryConfigured) {
    warnings.push('Cloudinary not fully configured - image uploads may not work');
  }

  if (missing.length > 0) {
    console.error(
      `❌ Missing required environment variables: ${missing.join(', ')}`
    );
    console.error('Please check your .env file in the backend directory');
    process.exit(1);
  }

  if (warnings.length > 0) {
    console.warn(
      `⚠️  Warnings:\n${warnings.map((w) => `  - ${w}`).join('\n')}`
    );
  }

  return {
    isValid: true,
    port: requiredEnvVars.PORT,
    nodeEnv: requiredEnvVars.NODE_ENV,
  };
};

module.exports = validateEnv;
