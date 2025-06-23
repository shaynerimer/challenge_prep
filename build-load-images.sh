#!/bin/bash

# build new images
docker build -t order-sender:latest ./order_sender
docker build -t order-processor:latest ./order_processor

# Clean up dangling images
docker rmi $(docker images --filter "dangling=true" -q --no-trunc)

# Load into kind cluster
kind load docker-image order-sender:latest
kind load docker-image order-processor:latest