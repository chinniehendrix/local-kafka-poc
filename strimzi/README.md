# Local Kafka v2.4.1 using Strimzi

1. Start Minikube
```
minikube start --memory=8Gi --cpus=2 --driver=hyperkit
```

2. Create a namespace called `kafka`
```
kubectl create ns kafka
```