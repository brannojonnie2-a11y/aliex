#!/bin/bash

# Start the API server in the background
node server.cjs &

# Start the frontend server
pnpm preview --host 0.0.0.0 --port ${PORT:-8080}
