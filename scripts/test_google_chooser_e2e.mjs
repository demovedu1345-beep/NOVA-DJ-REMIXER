import assert from 'assert';
import crypto from 'crypto';
import http from 'http';
import { handlePreflight, readJsonBody, sendJson } from '../api/_lib/http.js';
import meHandler from '../api/me.js';
import likesHandler from '../api/sets.js';

console.log('--- STARTING COMPREHENSIVE GOOGLE ACCOUNT CHOOSER & LIKES TEST ---');

// Mock request / response helper
function createMockReqRes({ method = 'GET', url = '/', headers = {}, body = null }) {
  const req = {
    method,
    url,
    headers: { host: 'localhost:3000', 'x-forwarded-proto': 'http', ...headers },
    body,
  };
  let statusCode = 200;
  let headersSent = {};
  let responseData = '';

  const res = {
    statusCode,
    setHeader(name, value) {
      headersSent[name.toLowerCase()] = value;
    },
    getHeader(name) {
      return headersSent[name.toLowerCase()];
    },
    end(data) {
      if (data) responseData += data;
    },
  };

  return { req, res, getStatus: () => res.statusCode, getHeaders: () => headersSent, getBody: () => JSON.parse(responseData || '{}') };
}

async function runTests() {
  // Test 1: Initial me status (Guest)
  {
    const { req, res, getBody } = createMockReqRes({ method: 'GET', url: '/api/me' });
    await meHandler(req, res);
    const body = getBody();
    console.log('✓ GET /api/me returned valid guest state:', body.user === null);
    assert.strictEqual(body.user, null);
  }

  // Test 2: Google Account Selection (Login as Vedant Sharma)
  let user1Cookie = '';
  {
    const { req, res, getHeaders, getBody } = createMockReqRes({
      method: 'POST',
      url: '/api/me',
      body: {
        action: 'google_account_select',
        email: 'vedant.sharma@gmail.com',
        name: 'Vedant Sharma',
        picture: 'https://lh3.googleusercontent.com/a/default-user',
      },
    });
    await meHandler(req, res);
    const body = getBody();
    console.log('✓ POST /api/me (google_account_select) logged in:', body.user.name, body.user.email);
    assert.strictEqual(body.ok, true);
    assert.strictEqual(body.user.email, 'vedant.sharma@gmail.com');
    assert.strictEqual(body.user.provider, 'google');
    const setCookies = getHeaders()['set-cookie'];
    assert.ok(setCookies && setCookies.length > 0);
    user1Cookie = setCookies.map(c => c.split(';')[0]).join('; ');
  }

  // Test 3: Like a track as Vedant Sharma
  {
    const track = {
      song_id: 'test_song_1',
      title: 'Kesariya',
      artist: 'Arijit Singh',
      youtube_ids: ['BddP6PYo2gs'],
      duration_sec: 210,
      entry_sec: 35,
      exit_sec: 75,
      language: 'hindi',
    };
    const { req, res, getBody } = createMockReqRes({
      method: 'POST',
      url: '/api/likes',
      headers: { cookie: user1Cookie },
      body: { track, forceLike: true },
    });
    await likesHandler(req, res);
    const body = getBody();
    console.log('✓ POST /api/likes saved track for user 1:', body.ok, 'user:', body.user?.email);
    assert.strictEqual(body.ok, true);
    assert.strictEqual(body.user?.email, 'vedant.sharma@gmail.com');
  }

  // Test 4: Google Account Selection for 2nd Account (Aditya Patel)
  let user2Cookie = '';
  {
    const { req, res, getHeaders, getBody } = createMockReqRes({
      method: 'POST',
      url: '/api/me',
      headers: { cookie: user1Cookie },
      body: {
        action: 'google_account_select',
        email: 'aditya.patel@gmail.com',
        name: 'Aditya Patel',
      },
    });
    await meHandler(req, res);
    const body = getBody();
    console.log('✓ POST /api/me (google_account_select) added 2nd account:', body.user.name);
    assert.strictEqual(body.user.email, 'aditya.patel@gmail.com');
    assert.strictEqual(body.accounts.length, 2);
    const setCookies = getHeaders()['set-cookie'];
    user2Cookie = setCookies.map(c => c.split(';')[0]).join('; ');
  }

  // Test 5: Verify account switcher (Switch back to Vedant Sharma)
  {
    // find vedant's account id
    const { req: getReq, res: getRes, getBody: getMeBody } = createMockReqRes({
      method: 'GET',
      url: '/api/me',
      headers: { cookie: user2Cookie },
    });
    await meHandler(getReq, getRes);
    const meBody = getMeBody();
    const vedantAcc = meBody.accounts.find(a => a.email === 'vedant.sharma@gmail.com');
    assert.ok(vedantAcc, 'Vedant account must exist in accounts list');

    const { req, res, getBody } = createMockReqRes({
      method: 'POST',
      url: '/api/me',
      headers: { cookie: user2Cookie },
      body: { action: 'switch_account', id: vedantAcc.id },
    });
    await meHandler(req, res);
    const body = getBody();
    console.log('✓ POST /api/me (switch_account) switched active user to:', body.user.name);
    assert.strictEqual(body.user.email, 'vedant.sharma@gmail.com');
  }

  console.log('--- ALL GOOGLE ACCOUNT CHOOSER & PER-ACCOUNT LIKES BACKEND TESTS PASSED ✓ ---');
}

runTests().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});
