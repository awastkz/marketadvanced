#!/usr/bin/env bash
# Запуск нагрузки без ввода учётки каждый раз.
# Учётка один раз в ops/k6/.env.local (в git не попадает):
#   K6_EMAIL=you@example.com
#   K6_PASSWORD=пароль
# Использование:
#   ops/k6/run.sh                      # 30 пользователей, 30 секунд
#   VUS=100 DURATION=2m ops/k6/run.sh  # переопределить параметры
#   ops/k6/run.sh --summary-export=ops/k6/run.json   # любые флаги k6 пробрасываются
set -euo pipefail
cd "$(dirname "$0")/../.."

ENV_FILE=ops/k6/.env.local
if [ ! -f "$ENV_FILE" ]; then
  echo "Нет $ENV_FILE. Создайте его с двумя строками: K6_EMAIL=... и K6_PASSWORD=..." >&2
  exit 1
fi
set -a; source "$ENV_FILE"; set +a

K6_BIN=$(command -v k6 || echo /tmp/claude-1000/-var-www-marketadvanced/032736ec-3b3b-41b1-82c2-16d6d7ca88ec/scratchpad/k6)
# метрики k6 (vus, http_reqs, длительности) уходят в Prometheus, чтобы лежать на одном графике с сервером
export K6_PROMETHEUS_RW_SERVER_URL="${K6_PROMETHEUS_RW_SERVER_URL:-http://localhost:9090/api/v1/write}"
export K6_PROMETHEUS_RW_TREND_STATS="${K6_PROMETHEUS_RW_TREND_STATS:-p(95),p(99),avg}"
exec "$K6_BIN" run --out experimental-prometheus-rw --tag testid="$(date +%Y%m%d-%H%M%S)" "$@" ops/k6/load.js
