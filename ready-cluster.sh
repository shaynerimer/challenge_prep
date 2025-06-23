#!/bin/bash

## Create kind cluster
kind create cluster --config ./deploy/kind-cluster-config.yaml

## Initialize Dapr
dapr init -k --log-as-json

## Configure Tracing with Zipkin
kubectl create deployment zipkin --image openzipkin/zipkin
kubectl expose deployment zipkin --type ClusterIP --port 9411
kubectl apply -f ./deploy/tracing.yaml

## Configure Logging with Fluentd + ELK Stack
kubectl create namespace dapr-monitoring
helm repo add elastic https://helm.elastic.co
helm repo update
helm install elasticsearch elastic/elasticsearch --version 7.17.3 -n dapr-monitoring --set persistence.enabled=false,replicas=1
helm install kibana elastic/kibana --version 7.17.3 -n dapr-monitoring
kubectl apply -f ./deploy/fluentd-config-map.yaml
kubectl apply -f ./deploy/fluentd-dapr-with-rbac.yaml

## Forward ports for zipkin and Kibana
# kubectl port-forward svc/zipkin 9411:9411 > /dev/null 2>&1 &
# kubectl port-forward svc/kibana-kibana 5601 -n dapr-monitoring > /dev/null 2>&1 &
