import bcrypt from "bcrypt";

async function hash(password) {
  const round = getNumberOfRounds();
  return await bcrypt.hash(password, round);
}

function getNumberOfRounds() {
  const round = process.env.NODE_ENV === "production" ? 14 : 1;
  return round;
}

async function compare(password, hash) {
  return await bcrypt.compare(password, hash);
}

const password = {
  hash,
  compare,
};

export default password;
