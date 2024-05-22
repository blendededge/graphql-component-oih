import axios, { AxiosError } from 'axios';
import { Auth, Self, AuthTypes, Headers, Request, GlobalLogContext } from './types/global';

const HTTP_ERROR_CODE_REBOUND = new Set([408, 423, 429, 500, 502, 503, 504]);
const AXIOS_TIMEOUT_ERROR = 'ECONNABORTED';

export function populateAuthHeaders(auth: Auth, self: Self, bearerToken: string, headers?: Array<Headers>,): Array<Headers> {
  const newHeaders = [];
  if (headers) {
    newHeaders.push(...headers)
  }

  switch (auth.type) {
    case AuthTypes.BASIC:
      newHeaders.push({
        key: 'Authorization',
        value: `"Basic ${Buffer.from(
          `${auth.basic?.username}:${auth.basic?.password}`,
          'utf8',
        ).toString('base64')}"`,
      });
      break;

    case AuthTypes.API_KEY:
      newHeaders.push({
        key: auth.apiKey?.headerName,
        value: auth.apiKey?.headerValue,
      });
      break;

    case AuthTypes.OAUTH2:
      self.logger.trace('auth = %j', auth);
      newHeaders.push({
        key: 'Authorization',
        value: `"Bearer ${bearerToken}"`,
      });
      break;

    default:
  }

  return newHeaders
}

export const makeRequest = async (self: Self, request: Request, httpReboundErrorCodes?: number[], enableRebound = false, dontThrowErrorFlg = false, timeout = 2500) => { // 2500 is axios default timeout
  const { body, headers, url } = request;
  self.logger.debug('body before request: ', JSON.stringify(body));
  self.logger.debug('headers before request: ', JSON.stringify(headers));

  const reboundErrorCodes = getHttpReboundErrorCodes(httpReboundErrorCodes);
  try {
    const response = await axios.post(url, body, { timeout, headers });
    const { data, status } = response;

    self.logger.debug('GraphQL response data: ', JSON.stringify(data));
    self.logger.debug('GraphQL response status: ', status);

    if (enableRebound && reboundErrorCodes.has(status)) {
      self.logger.info(`Rebounding due to status code ${status}`);
      await self.emit('rebound', { status, data });
    } else {
      await self.emit('data', { data });
      await self.emit('end');
    }
  } catch (e) {
    await handleRequestError((e as Error | AxiosError<unknown, unknown>), self, httpReboundErrorCodes, enableRebound, dontThrowErrorFlg);
  }
};

async function handleRequestError(e: Error | AxiosError, self: Self, httpReboundErrorCodes?: number[], enableRebound = false, dontThrowErrorFlg = false) {
  const reboundErrorCodes = getHttpReboundErrorCodes(httpReboundErrorCodes);

  self.logger.debug(`Configured HTTP error status codes for rebound are ${Array.from(reboundErrorCodes.values())}`);

  if (
    (enableRebound && e instanceof AxiosError && e?.response && reboundErrorCodes.has(e?.response?.status)) ||
    (enableRebound && (e instanceof AxiosError && e.code === AXIOS_TIMEOUT_ERROR || e.message.includes('DNS lookup timeout')))
  ) {
    self.logger.info('Starting rebound, Component error: ', JSON.stringify(e), addErrorLogContext(e));
    await self.emit('rebound', e.message);
  } else if (e instanceof AxiosError && e.response && dontThrowErrorFlg) {
    const output = {
      errorCode: e.response.status,
      errorMessage: e.message,
      errorStack: e.stack,
      errorData: e.response.data,
      errorHeaders: e.response.headers,
    };

    await self.emit('data', { data: output });
    await self.emit('end');
  } else {
    self.logger.error('Component error: ', JSON.stringify(e), addErrorLogContext(e));
    if (e.message.indexOf('timeout') >= 0) {
      e.message = 'Timeout error! Waiting for response more than the set limit';
    }
    await self.emit('error', e);
    await self.emit('end');
  }
}

function addErrorLogContext(e: Error | AxiosError) {
  const logContext: GlobalLogContext = {};
  if (e && e instanceof Error) {
    logContext.errorMessage = e.message;
    logContext.errorStack = e.stack;
  }
  if (e && e instanceof AxiosError && e.response) {
    logContext.errorData = e.response.data;
    logContext.errorCode = e.response.status;
    logContext.errorHeaders = e.response.headers;
  }
  return logContext;
}

function getHttpReboundErrorCodes(httpReboundErrorCodes: number[] | undefined) {
  return httpReboundErrorCodes ? new Set(httpReboundErrorCodes) : HTTP_ERROR_CODE_REBOUND;
}