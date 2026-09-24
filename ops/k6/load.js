// Нагрузка на список товаров каталога с авторизацией.
// Запуск:  K6_EMAIL=you@example.com K6_PASSWORD='пароль' k6 run ops/k6/load.js
// Учётка — любой существующий аккаунт на сайте. Токен берётся один раз в setup()
// и раздаётся всем виртуальным пользователям, логин под нагрузку не попадает.

import http from 'k6/http'
import { check, fail } from 'k6'

const API = __ENV.API_URL || 'http://localhost:5080'
const CATALOG = __ENV.CATALOG_URL || 'http://localhost:5081'

export const options = {
  vus: Number(__ENV.VUS || 30),
  duration: __ENV.DURATION || '30s',
  thresholds: {
    http_req_duration: ['p(95)<500'],
    http_req_failed: ['rate<0.01'],
  },
}

export function setup() {
  if (!__ENV.K6_EMAIL || !__ENV.K6_PASSWORD) fail('нужны K6_EMAIL и K6_PASSWORD')

  const r = http.post(
    `${API}/api/auth/login`,
    JSON.stringify({ email: __ENV.K6_EMAIL, password: __ENV.K6_PASSWORD }),
    { headers: { 'Content-Type': 'application/json' } },
  )
  if (r.status !== 200) fail(`логин не удался: ${r.status} ${r.body}`)
  return { token: r.json('access_token') }
}

export default function (data) {
  const headers = { Authorization: `Bearer ${data.token}` }
  const page = Math.floor(Math.random() * 500) + 1
  // tags.name: иначе k6 заведёт в Prometheus отдельную серию на каждый URL со своим page=N
  const r = http.get(`${CATALOG}/api/admin/products?isActive=true&page=${page}&pageSize=20`, {
    headers,
    tags: { name: 'products-list' },
  })
  check(r, { 'status 200': (res) => res.status === 200 })
}
