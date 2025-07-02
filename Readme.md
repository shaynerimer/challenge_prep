### WSL Dependencies
- Docker
- Dapr
- Kind
- Kubectl
- Helm  
~~~ 
sudo snap install helm --classic 
~~~

### Run on Local Kubernetes
~~~
./ready-cluster.sh
./build-load-iamges.sh
kubectl port-forward svc/zipkin 9411:9411 > /dev/null 2>&1 &
kubectl port-forward svc/kibana-kibana 5601 -n dapr-monitoring > /dev/null 2>&1 &
~~~~