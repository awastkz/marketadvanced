#!/usr/bin/env bash
# N запросов в секунду на один эндпоинт, метрики k6 уходят в Prometheus (дашборд «нагрузка и ресурсы»).
# Остановить: Ctrl+C. Сменить темп: остановить и запустить с другим RATE, либо задать ступени STAGES.
# Использование:
#   RATE=500 DURATION=3m BODY='{"items":[...]}' ops/k6/rps.sh          # POST api/orders
#   RATE=1000 URL=http://localhost:5080/api/products ops/k6/rps.sh       # GET на любой адрес
#   STAGES="200:1m,500:1m,1000:1m" BODY='...' ops/k6/rps.sh             # ступени
set -euo pipefail
cd "$(dirname "$0")/../.."

export K6_PROMETHEUS_RW_SERVER_URL="${K6_PROMETHEUS_RW_SERVER_URL:-http://localhost:9090/api/v1/write}"
export K6_PROMETHEUS_RW_TREND_STATS="${K6_PROMETHEUS_RW_TREND_STATS:-p(95),p(99),avg}"
exec k6 run --out experimental-prometheus-rw --tag testid="$(date +%Y%m%d-%H%M%S)" "$@" ops/k6/rps.js
