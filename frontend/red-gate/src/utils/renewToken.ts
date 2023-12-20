const checkAndRenewToken = async (token: RenewToken, setCookie: (name: "accessToken" | "refreshToken" | "accessTokenEx", value: any, options?: object | undefined) => void) => {
  const { accessTokenExpire, refreshToken } = token;

  if (new Date() > accessTokenExpire) {
    console.log("Renewing token...")
    const payload = new URLSearchParams();
    payload.append('refresh_token', refreshToken);

    try {
      const response = await fetch('https://172.173.157.174:4343/auth/renewToken', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: payload.toString(),
      });

      if (response.ok) {
        const renewedToken = await response.json() as LoginResponseJson;
        setCookie('accessToken', renewedToken.access_token);
        setCookie('accessTokenEx', renewedToken.access_token_expire);
      } else {
        throw new Error('Token renewal failed with status: ' + response.statusText);
      }
    } catch (error) {
      throw new Error('Token renewal failed');
    }
  }
};

export default checkAndRenewToken;