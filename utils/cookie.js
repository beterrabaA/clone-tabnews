export function parseCookies(cookiesString) {
  const emyCookie = {}; // "same" as new Object()

  const splitedCookie = cookiesString[0].split(";");
  for (let i = 1; i < splitedCookie.length; i++) {
    const [key, value] = splitedCookie[i].split("=");
    const lowerCasedKey =
      key.trim().charAt(0).toLowerCase() + key.trim().slice(1);

    if (value) {
      emyCookie[lowerCasedKey.replace(/-/g, "")] = parseInt(value)
        ? parseInt(value)
        : value;
    } else {
      emyCookie[lowerCasedKey.replace(/-/g, "")] = true;
    }
  }

  const [key, value] = splitedCookie[0].split("=");
  emyCookie["name"] = key;
  emyCookie["value"] = value;

  return emyCookie;
}
