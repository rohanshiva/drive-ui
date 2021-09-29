const refresh = () => window.location.reload();

const pullToken = () => {
  // return token (string) or null
  const accessTokenKey = Object.keys(localStorage).filter((k) =>
    k.endsWith("accessToken")
  )[0];
  return localStorage.getItem(accessTokenKey);
};

const expiredToken = (token) => {
  // returns boolean
  const { exp } = JSON.parse(atob(token.split(".")[1]));
  return exp < Math.floor(Date.now() / 1000);
};

export async function getAccessToken() {
  const token = pullToken();

  if (!token || expiredToken(token)) {
    if (process.env.REACT_APP_ENV !== "standalone") {
      const Auth = await import("@aws-amplify/auth");
      // token is null or expired, try and get a new token or return to sign-in
      const resp = await Auth.currentSession().catch((err) => null);
      if (!resp) return refresh();
    }
    return pullToken();
  }

  return token;
}
