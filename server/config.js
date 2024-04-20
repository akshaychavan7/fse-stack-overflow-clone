const generateSecretKey = () => {
  // const secretKey =
  //   Math.random().toString(36).substring(2, 15) +
  //   Math.random().toString(36).substring(2, 15);
  const secretKey = "SECRET_KEY";
  return secretKey;
};

// const MONGO_URL = "mongodb://mongodb:27017/fake_so_fse"; // enable this for docker
const MONGO_URL = "mongodb://localhost:27017/fake_so_fse"; // enable this for local testing

const CLIENT_URL = "http://localhost:3000";
const port = 8000;
const SECRET_KEY = generateSecretKey();

module.exports = {
  MONGO_URL,
  CLIENT_URL,
  port,
  SECRET_KEY,
};
