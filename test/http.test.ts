import { expect } from 'chai';
import sinon from 'sinon';
import nock from 'nock';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import axios, { AxiosHeaders } from 'axios';
import { makeRequest } from '../lib/http'; // Adjust the import according to your file structure
import { Self, Request } from '../lib/types/global'; // Adjust the import according to your file structure

describe('makeRequest', () => {
  let self: Self;
  let logger: sinon.SinonStubbedInstance<Console>;

  beforeEach(() => {
    logger = sinon.stub(console);
    self = {
      logger,
      emit: sinon.stub().resolves(),
    } as unknown as Self;
  });

  afterEach(() => {
    sinon.restore();
    nock.cleanAll();
  });

  it('should emit data and end events on successful request', async () => {
    const request: Request = {
        headers: { 'Content-Type': 'application/json' } as unknown as AxiosHeaders,
        body: JSON.stringify({ query: '{ example }' }),
        url: 'http://api.example.com/graphql',
    };

    nock('http://api.example.com')
        .post('/graphql')
        .reply(200, { data: { example: 'value' } });

    await makeRequest(self, request, [500, 502, 503, 504], false);
    const calls = self.emit.getCalls();
    logger.error('hello', JSON.stringify(calls, null, 2));
    // expect(self.emit.calledWithExactly('data', { data: { example: 'value' } })).to.be.true;
    // expect(self.emit.calledWithExactly('end')).to.be.true;
    const dataCall = self.emit.getCalls().find(call => call.args[0] === 'data');
    const endCall = self.emit.getCalls().find(call => call.args[0] === 'end');
    expect(dataCall).to.not.be.undefined;
    expect(dataCall.args[1]?.data).to.deep.equal({ data: { example: 'value' } });

    expect(endCall).to.not.be.undefined;
  });

  it('should emit rebound event on configured status codes', async () => {
    const request: Request = {
      headers: { 'Content-Type': 'application/json' } as unknown as AxiosHeaders,
      body: JSON.stringify({ query: '{ example }' }),
      url: 'https://api.example.com/graphql',
    };

    nock('https://api.example.com')
      .post('/graphql')
      .reply(503, { error: 'Service Unavailable' });

    await makeRequest(self, request, undefined, true);

    const reboundCall = self.emit.getCalls().find(call => call.args[0] === 'rebound');
    expect(reboundCall).to.not.be.undefined;
    expect(reboundCall.args[1]).to.equal('Request failed with status code 503');
  });

  it('should emit error event as data on non-rebound error', async () => {
    const request: Request = {
      headers: { 'Content-Type': 'application/json' } as unknown as AxiosHeaders,
      body: JSON.stringify({ query: '{ example }' }),
      url: 'https://api.example.com/graphql',
    };

    nock('https://api.example.com')
      .post('/graphql')
      .reply(400, { error: 'Bad Request' });

    await makeRequest(self, request, [500], false, true);

    const errorCall = self.emit.getCalls().find(call => call.args[0] === 'data');
    expect(errorCall).to.not.be.undefined;
    expect(errorCall.args[1]?.data?.errorCode).to.equal(400);
    expect(errorCall.args[1]?.data?.errorMessage).to.equal('Request failed with status code 400');
    // expect(self.emit.calledWith('error')).to.be.true;
  });

  it('should emit error event on non-rebound error', async () => {
    const request: Request = {
      headers: { 'Content-Type': 'application/json' } as unknown as AxiosHeaders,
      body: JSON.stringify({ query: '{ example }' }),
      url: 'https://api.example.com/graphql',
    };

    nock('https://api.example.com')
      .post('/graphql')
      .reply(400, { error: 'Bad Request' });

    await makeRequest(self, request, [500], false, false);

    const errorCall = self.emit.getCalls().find(call => call.args[0] === 'error');
    expect(errorCall).to.not.be.undefined;
    expect(errorCall.args[1]?.response?.status).to.equal(400);
    expect(errorCall.args[1]?.response?.data?.error).to.equal('Bad Request');
  });

  it('should emit rebound event on timeout', async () => {
    const request: Request = {
      headers: { 'Content-Type': 'application/json' } as unknown as AxiosHeaders,
      body: JSON.stringify({ query: '{ example }' }),
      url: 'https://api.example.com/graphql',
    };

    nock('https://api.example.com')
      .post('/graphql')
      .delay(300) // Simulate a timeout
      .reply(200, { data: { example: 'value' } });

    await makeRequest(self, request, [500], true, false, 100);

    const reboundCall = self.emit.getCalls().find(call => call.args[0] === 'rebound');
    expect(reboundCall).to.not.be.undefined;
  });

  it('should emit error event on network error', async () => {
    const request: Request = {
      headers: { 'Content-Type': 'application/json' } as unknown as AxiosHeaders,
      body: JSON.stringify({ query: '{ example }' }),
      url: 'https://api.example.com/graphql',
    };

    nock('https://api.example.com')
      .post('/graphql')
      .replyWithError('Network error');

    await makeRequest(self, request, [500], true);

    expect(self.emit.calledWith('error')).to.be.true;
  });
});
