#!/bin/bash

SESSION_NAME="order_dapr_test"

# Create a new detached tmux session
tmux new-session -d -s "$SESSION_NAME"

# Split the window horizontally and vertically
tmux split-window -h -t "$SESSION_NAME"
tmux split-window -t "$SESSION_NAME"

# Order Processor (pane 0)
tmux send-keys -t "$SESSION_NAME:0.0" "dapr run --app-id joke-generator --app-port 3010 --resources-path ./deploy/dapr_components/ -- node --env-file ./joke_generator/.env ./joke_generator/main.js" C-m

# Web App (pane 1)
tmux send-keys -t "$SESSION_NAME:0.1" "cd ./web_app; " "dapr run --app-id web-app --resources-path ../deploy/dapr_components/ --app-port 3000 -- pnpm next dev --turbopack" C-m

# GraphQL (pane 2)
tmux send-keys -t "$SESSION_NAME:0.2" "dapr run --app-id graphql-engine --app-port 4000 -- node ./graphql_engine/src/index.js" C-m

# Attach to the session
tmux attach-session -t "$SESSION_NAME"
