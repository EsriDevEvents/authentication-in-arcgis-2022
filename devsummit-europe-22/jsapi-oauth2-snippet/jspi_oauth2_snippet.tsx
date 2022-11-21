const portalLogin = async (): Promise<void> => {
  const oAuthInfo = new OAuthInfo({
    appId: <appId>,
    portalUrl: <arcgisServer> + endpoints.portal,
    popup: false,
  });

  portal = new Portal({
    url: <arcgisServer> + endpoints.portal,
  });
  await portal.load();

  IdentityManager.registerOAuthInfos([oAuthInfo]);

  try {
    const signInEvt: Credential = await IdentityManager.checkSignInStatus(
      `${oAuthInfo.portalUrl}${endpoints.sharing}`
    );
    userId = signInEvt.userId;
    storeCredentialsInApp({ portal: portal, userId: userId });
  } catch (error) {
    console.error(error.message);
    const signInEvt: Credential = await IdentityManager.getCredential(
      `${oAuthInfo.portalUrl}${endpoints.sharing}`,
      {
        oAuthPopupConfirmation: false,
      }
    );
    userId = signInEvt.userId;
    storeCredentialsInApp({ portal: portal, userId: userId });
  }
};