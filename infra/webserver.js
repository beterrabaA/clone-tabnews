function getOrigin() {
  if (["test", "development"].includes(process.env.NODE_ENV)) {
    return "http://localhost:3000";
  }

  if (process.env.VERCEL_ENV === "preview") {
    return `https://${process.env.VERCEL_URL}`;
  }

  return process.env.ORIGIN;
}

const webserver = {
  getOrigin: getOrigin(),
};

export default webserver;
