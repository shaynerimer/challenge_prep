#!/bin/bash

####################
## NEEDS REVIEW ####
####################

# build new images
docker build -t order-processor:latest ./order_processor

# Clean up dangling images
docker rmi $(docker images --filter "dangling=true" -q --no-trunc)

# Load into kind cluster
kind load docker-image order-processor:latest
