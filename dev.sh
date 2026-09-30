#!/usr/bin/env bash
# Start/stop/status for local development (Django API + Vite frontend)
# Usage: ./dev.sh {start|stop|status}

BACKEND_DIR="ymca_api"
BACKEND_PID="/tmp/ymca_backend.pid"
FRONTEND_PID="/tmp/ymca_frontend.pid"
BACKEND_LOG="/tmp/backend.log"
FRONTEND_LOG="/tmp/frontend.log"

start_backend() {
  if [ -f "$BACKEND_PID" ] && kill -0 "$(cat "$BACKEND_PID")" 2>/dev/null; then
    echo "backend already running (PID $(cat "$BACKEND_PID"))"
    return
  fi
  cd "$BACKEND_DIR" || exit 1
  setsid nohup ./venv/bin/python manage.py runserver 0.0.0.0:8000 > "$BACKEND_LOG" 2>&1 < /dev/null &
  echo $! > "$BACKEND_PID"
  cd - > /dev/null
  sleep 3
  if curl -sf -o /dev/null http://127.0.0.1:8000/api/v1/total-members-count; then
    echo "backend UP   -> http://127.0.0.1:8000  (log: $BACKEND_LOG)"
  else
    echo "backend FAILED to start — check $BACKEND_LOG"
  fi
}

start_frontend() {
  if [ -f "$FRONTEND_PID" ] && kill -0 "$(cat "$FRONTEND_PID")" 2>/dev/null; then
    echo "frontend already running (PID $(cat "$FRONTEND_PID"))"
    return
  fi
  setsid nohup npm run dev > "$FRONTEND_LOG" 2>&1 < /dev/null &
  echo $! > "$FRONTEND_PID"
  sleep 5
  if curl -sf -o /dev/null http://127.0.0.1:5173/; then
    echo "frontend UP  -> http://localhost:5173  (log: $FRONTEND_LOG)"
  else
    echo "frontend FAILED to start — check $FRONTEND_LOG"
  fi
}

stop_pidfile() {
  if [ -f "$1" ]; then
    PID="$(cat "$1")"
    kill -- -"$PID" 2>/dev/null || kill "$PID" 2>/dev/null
    rm -f "$1"
  fi
}

case "$1" in
  start)
    start_backend
    start_frontend
    ;;
  stop)
    stop_pidfile "$FRONTEND_PID"
    stop_pidfile "$BACKEND_PID"
    pkill -f "manage.py runserver" 2>/dev/null
    pkill -f "vite" 2>/dev/null
    echo "stopped."
    ;;
  status)
    curl -sf -o /dev/null http://127.0.0.1:8000/api/v1/total-members-count \
      && echo "backend : UP   http://127.0.0.1:8000" || echo "backend : DOWN"
    curl -sf -o /dev/null http://127.0.0.1:5173/ \
      && echo "frontend: UP   http://localhost:5173" || echo "frontend: DOWN"
    ;;
  *)
    echo "Usage: ./dev.sh {start|stop|status}"
    ;;
esac
