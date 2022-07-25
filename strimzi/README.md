# Local Kafka v2.4.1 using Strimzi

1. Start Minikube
```
minikube start --memory=6Gb --kubernetes-version=1.21.14 --driver=hyperkit --profile=strimzi
```

2. Create a namespace called `kafka`
```
kubectl create ns kafka
```

3. Install the Kafka Cluster Operator
```
kubectl apply -f cluster-operator/ -n kafka
```

4. Give permission to the Cluster Operator to watch the `kafka` namespace.
```
kubectl apply -f cluster-operator/020-RoleBinding-strimzi-cluster-operator.yaml -n kafka

kubectl apply -f cluster-operator/032-RoleBinding-strimzi-cluster-operator-topic-operator-delegation.yaml -n kafka

kubectl apply -f cluster-operator/031-RoleBinding-strimzi-cluster-operator-entity-operator-delegation.yaml -n kafka
```

5. Create the Kafka cluster
```
kubectl apply -f kafka-cluster.yaml
```

6. Create a topic
```
kubectl apply -f topic.yaml
```

7. Run a consumer
```
kubectl run -ti --image=bitnami/kafka:2.4.1 consume -n kafka --restart=Never --rm -- kafka-console-consumer.sh --topic my-topic --bootstrap-server my-cluster-kafka-bootstrap:9092
```

8. Run a producer
```
kubectl run -ti --image=bitnami/kafka:2.4.1 consume -n kafka --restart=Never --rm -- kafka-console-consumer.sh --topic my-topic --bootstrap-server my-cluster-kafka-bootstrap:9092
```



