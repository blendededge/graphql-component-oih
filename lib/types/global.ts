import { AxiosRequestHeaders } from 'axios';

export type GenericObject = Record<string, unknown>;

export const POST = 'POST';

export interface Message {
    id: string,
    attachments: GenericObject;
    data?: GenericObject;
    headers: GenericObject;
    metadata: GenericObject;
}

export interface Config {
    query: string;
    headers: Headers[];
    variables?: string;
    url: string;
    auth?: Auth;
    username?: string;
    passphrase?: string;
    key?: string;
    headerName?: string;
    accessToken?: string;
    secretAuthTransform?: string;
}

export interface Headers {
    key?: string;
    value?: string;
}

export interface Auth {
    type?: string;
    basic?: Basic;
    apiKey?: ApiKey;
    oauth2?: OAuth2;
}

export interface Basic {
    username: string;
    password: string;
}

export interface ApiKey {
    headerName: string;
    headerValue: string;
}

export interface OAuth2 {
    keys: OAuth2Keys;
}

export interface OAuth2Keys {
    access_token: string;
}

export enum AuthTypes {
    NO_AUTH = 'No Auth',
    BASIC = 'Basic Auth',
    API_KEY = 'API Key Auth',
    OAUTH2 = 'OAuth2'
}

export interface Request {
    headers: AxiosRequestHeaders;
    body: string;
    url: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Self = any;