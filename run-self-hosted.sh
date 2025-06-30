#!/bin/bash

SESSION_NAME="order_dapr_test"

# Create a new detached tmux session
tmux new-session -d -s "$SESSION_NAME"

# Split the window horizontally
tmux split-window -h -t "$SESSION_NAME"

# Send commands to the first pane (pane 0)
tmux send-keys -t "$SESSION_NAME:0.0" "dapr run --app-id order-processor --app-port 3010 -- node ./order_processor/order_processor.js" C-m

# Send commands to the second pane (pane 1)
tmux send-keys -t "$SESSION_NAME:0.1" "cd ./web_app; " "dapr run --app-id web-app --app-port 3000 -- pnpm next dev --turbopack" C-m

# Attach to the session
tmux attach-session -t "$SESSION_NAME"
