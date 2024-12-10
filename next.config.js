/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    SERVER_URL: "https://fastapipredictdocker.onrender.com",
  },
  // Add package overrides to resolve dependency conflicts
  overrides: {
    "starlette": "0.27.0",
    "numpy": "1.25.0"
  }
};

module.exports = nextConfig;