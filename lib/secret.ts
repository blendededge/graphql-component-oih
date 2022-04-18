import { Auth, Config, Self, AuthTypes } from './types/global';
import { transform } from '@openintegrationhub/ferryman';

export function getAuthFromSecretConfig(cfg: Config, self: Self) {
  const {
    username, passphrase, key, headerName, accessToken, secretAuthTransform,
  } = cfg;
  const returnConfig = { ...cfg };
  const auth: Auth = returnConfig.auth || {}

  // Use JSONata to populate cfg.auth object, works for all types but especially helpful for the MIXED type
  if (secretAuthTransform) {
    returnConfig.auth = transform(cfg, { customMapping: secretAuthTransform });
    self.logger.debug(`helpers.getAuthFromSecretConfig: after transforming auth config: ${JSON.stringify(returnConfig)}`);
    return returnConfig;
  }
  // Found username and password, authenticate with basic authentication
  if (username && passphrase) {
    auth.basic = auth.basic ? auth.basic : { username: '', password: '' };
    auth.type = AuthTypes.BASIC;
    auth.basic.username = username;
    auth.basic.password = passphrase;
  }
  // Found API_KEY type
  if (key && headerName) {
    auth.type = AuthTypes.API_KEY;
    auth.apiKey = auth.apiKey ? auth.apiKey : { headerName: '', headerValue: '' };
    auth.apiKey.headerName = headerName;
    auth.apiKey.headerValue = key;
  }
  // Found an accessToken from OA1_TWO_LEGGED, OA1_THREE_LEGGED, OA2_AUTHORIZATION_CODE, or SESSION_AUTH types
  if (accessToken) {
    auth.type = AuthTypes.OAUTH2;
    auth.oauth2 = auth.oauth2 ? auth.oauth2 : { keys: { access_token: '' } };
    auth.oauth2.keys = auth.oauth2.keys ? auth.oauth2.keys : { access_token: '' };
    auth.oauth2.keys.access_token = accessToken;
  }
  returnConfig.auth = auth;
  self.logger.debug(`getAuthFromSecretConfig: config object is now: ${JSON.stringify(returnConfig)}`);
  return returnConfig;
}