module.exports = {
  development: {
    username: 'logistic_user',
    password: 'password123',
    database: 'logistic_db',
    host: '127.0.0.1',
    dialect: 'postgres'
  },
  test: {
    username: 'logistic_user',
    password: 'password123',
    database: 'logistic_db_test',
    host: '127.0.0.1',
    dialect: 'postgres'
  },
  production: {
    username: 'logistic_user',
    password: 'password123',
    database: 'logistic_db_prod',
    host: '127.0.0.1',
    dialect: 'postgres'
  }
};
