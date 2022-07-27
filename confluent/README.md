# Confluent Kafka PoC

This PoC uses plain K8s manifests using Confluent-based container images.

## Running the PoC
1. Start Minikube
```
minikube start --memory=8Gi --cpus=2 --driver=hyperkit
```
2. Deploy Zookeeper
```
kubectl apply -f zookeeper.yaml
```
3. Deploy Kafka
```
kubectl apply -f kafka.yaml
```
Once all the pods are up and running...

4. Create a test topic
```
kubectl run -ti --image=bitnami/kafka:2.4.1 create-topic --restart=Never --rm -- kafka-topics.sh --create --topic test01 --partitions 1 --replication-factor 1 --zookeeper zookeeper:2181
```

5. Consume from the test topic
```
kubectl run -ti --image=bitnami/kafka:2.4.1 consume --restart=Never --rm -- kafka-console-consumer.sh --topic test01 --bootstrap-server kafka:9092
```

5. Produce to the test topic
```
kubectl run -ti --image=bitnami/kafka:2.4.1 produce --restart=Never --rm -- kafka-console-producer.sh --topic test01 --broker-list kafka:9092
```