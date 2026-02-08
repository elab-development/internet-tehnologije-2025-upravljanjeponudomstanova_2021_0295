require('dotenv').config();

const dbUrl = process.env.DATABASE_URL;

if (!dbUrl) {
  throw new Error('DATABASE_URL nije definisan. Proveri .env u root folderu.');
}

module.exports = {
  development: {
    url: dbUrl,
    dialect: 'postgres'
  },
  test: {
    url: dbUrl,
    dialect: 'postgres'
  },
  production: {
    url: dbUrl,
    dialect: 'postgres'
  }
};

