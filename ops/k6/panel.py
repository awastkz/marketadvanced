#!/usr/bin/env python3
"""Страница управления нагрузкой: адрес, запросов в секунду, старт/стоп. Запускает ops/k6/rps.sh.

  python3 ops/k6/panel.py            # http://localhost:8090
  PORT=9000 python3 ops/k6/panel.py
  HOST=0.0.0.0 python3 ops/k6/panel.py   # открыть наружу: любой, кто достанет порт, сможет слать нагрузку
"""
import collections
import json
import os
import signal
import subprocess
import threading
import time
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

DIR = Path(__file__).resolve().parent
ROOT = DIR.parent.parent
HOST = os.environ.get("HOST", "127.0.0.1")
PORT = int(os.environ.get("PORT", "8090"))

lock = threading.Lock()
proc = None
params = None
started_at = None
log = collections.deque(maxlen=300)


def read_output(p):
    for line in p.stdout:
        line = line.rstrip("\n")
        # k6 раз в секунду печатает пару строк прогресса: держим только последнюю пару
        if line.startswith("running (") and len(log) >= 2 and log[-2].startswith("running ("):
            log.pop()
            log.pop()
        if line or (log and log[-1]):
            log.append(line)
    p.wait()
    log.append(f"--- k6 завершился, код {p.returncode} ---")


def stop():
    """Ctrl+C для k6: он дорабатывает начатые запросы и печатает итог."""
    global proc
    if proc is None or proc.poll() is not None:
        return
    proc.send_signal(signal.SIGINT)
    try:
        proc.wait(timeout=10)
    except subprocess.TimeoutExpired:
        proc.kill()
        proc.wait()


def start(p):
    global proc, params, started_at
    url = str(p.get("url", "")).strip()
    if not url.startswith(("http://", "https://")):
        raise ValueError("Адрес должен начинаться с http:// или https://")
    rate = int(p.get("rate") or 0)
    if not 1 <= rate <= 100_000:
        raise ValueError("Запросов в секунду: от 1 до 100000")
    body = str(p.get("body") or "").strip()
    if body:
        json.loads(body)  # сломанный JSON лучше поймать здесь, чем получить 400 на каждый запрос
    method = str(p.get("method") or ("POST" if body else "GET")).upper()
    # пустая длительность = до кнопки «Стоп»
    duration = str(p.get("duration") or "").strip() or "24h"

    stop()
    env = {**os.environ, "URL": url, "METHOD": method, "RATE": str(rate), "DURATION": duration}
    for key in ("BODY", "STAGES", "TOKEN"):
        env.pop(key, None)
    if body and method != "GET":
        env["BODY"] = body
    if p.get("token"):
        env["TOKEN"] = str(p["token"]).strip()

    log.clear()
    proc = subprocess.Popen(
        [str(DIR / "rps.sh")], cwd=ROOT, env=env, text=True,
        stdout=subprocess.PIPE, stderr=subprocess.STDOUT,
    )
    params = {"url": url, "method": method, "rate": rate, "duration": duration}
    started_at = time.time()
    threading.Thread(target=read_output, args=(proc,), daemon=True).start()


class Handler(BaseHTTPRequestHandler):
    def log_message(self, *args):
        pass

    def send_json(self, data, status=200):
        raw = json.dumps(data, ensure_ascii=False).encode()
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(raw)))
        self.end_headers()
        self.wfile.write(raw)

    def status(self):
        running = proc is not None and proc.poll() is None
        return {"running": running, "params": params, "startedAt": started_at, "log": list(log)}

    def do_GET(self):
        if self.path == "/":
            raw = (DIR / "panel.html").read_bytes()
            self.send_response(200)
            self.send_header("Content-Type", "text/html; charset=utf-8")
            self.send_header("Content-Length", str(len(raw)))
            self.end_headers()
            self.wfile.write(raw)
        elif self.path == "/api/status":
            self.send_json(self.status())
        else:
            self.send_json({"message": "не найдено"}, 404)

    def do_POST(self):
        # только application/json: чужая страница в браузере не сможет отправить такой запрос без preflight
        if self.headers.get("Content-Type", "").split(";")[0].strip() != "application/json":
            return self.send_json({"message": "нужен Content-Type: application/json"}, 415)
        raw = self.rfile.read(int(self.headers.get("Content-Length") or 0))
        try:
            with lock:
                if self.path == "/api/start":
                    start(json.loads(raw or b"{}"))
                elif self.path == "/api/stop":
                    stop()
                else:
                    return self.send_json({"message": "не найдено"}, 404)
        except (ValueError, TypeError) as e:
            return self.send_json({"message": str(e)}, 400)
        self.send_json(self.status())


if __name__ == "__main__":
    server = ThreadingHTTPServer((HOST, PORT), Handler)
    print(f"Панель нагрузки: http://{'localhost' if HOST in ('127.0.0.1', '0.0.0.0') else HOST}:{PORT}")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        stop()
