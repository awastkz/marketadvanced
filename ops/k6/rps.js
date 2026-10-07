// Ровно N запросов в секунду на один эндпоинт (открытая модель: темп не зависит от скорости ответа).
// Запуск через ops/k6/rps.sh. Параметры — переменные окружения:
//   URL       адрес, по умолчанию POST заказа
//   METHOD    по умолчанию POST, если есть BODY, иначе GET
//   BODY      JSON-тело строкой
//   RATE      запросов в секунду, по умолчанию 100
//   DURATION  длительность, по умолчанию 1m
//   STAGES    ступени вместо RATE/DURATION: "200:1m,500:1m,1000:2m" (темп:время)
//   TOKEN     Bearer-токен, если эндпоинт закрыт
//   MAX_VUS   потолок одновременных запросов, по умолчанию не больше 2000

import http from 'k6/http'
import { check } from 'k6'
import { uuidv4 } from 'https://jslib.k6.io/k6-utils/1.4.0/index.js'

const URL = __ENV.URL || 'http://localhost:5080/api/orders'
const BODY = __ENV.BODY || null
const METHOD = (__ENV.METHOD || (BODY ? 'POST' : 'GET')).toUpperCase()
const RATE = Number(__ENV.RATE || 100)

const stages = (__ENV.STAGES || '')
  .split(',')
  .filter(Boolean)
  .map((s) => {
    const [target, duration] = s.split(':')
    return { target: Number(target), duration }
  })
const peak = stages.length ? Math.max(...stages.map((s) => s.target)) : RATE

// VU нужен только на время одного запроса; запас на случай, когда сервер начнёт отвечать медленно
// потолок 2000: если столько запросов висит одновременно, сервер уже не справляется, а каждый VU стоит памяти
const vus = {
  preAllocatedVUs: Math.max(20, Math.ceil(peak / 5)),
  maxVUs: Number(__ENV.MAX_VUS || Math.min(2000, Math.max(200, peak * 2))),
}

export const options = {
  scenarios: {
    rps: stages.length
      ? { executor: 'ramping-arrival-rate', startRate: stages[0].target, timeUnit: '1s', stages, ...vus }
      : { executor: 'constant-arrival-rate', rate: RATE, timeUnit: '1s', duration: __ENV.DURATION || '1m', ...vus },
  },
}

export default function () {
  const headers = {
    'Content-Type': 'application/json',
    // у каждого запроса свой гость: заказы не слипаются в одного владельца
    'X-Guest-Id': uuidv4(),
  }
  if (__ENV.TOKEN) headers.Authorization = `Bearer ${__ENV.TOKEN}`

  // tags.name: одна серия в Prometheus на весь прогон, а не по серии на каждый URL
  const r = http.request(METHOD, URL, BODY, { headers, timeout: '10s', tags: { name: __ENV.NAME || 'rps' } })
  check(r, { 'status 2xx': (res) => res.status >= 200 && res.status < 300 })
}
