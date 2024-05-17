#!/bin/sh

if [ -z "$SERVER_PORT" ]; then
  SERVER_PORT=4000
fi

curl -f http://localhost:$SERVER_PORT/app/health || exit 1