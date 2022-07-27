# Setting Mutual TLS with Simple Authorization

Follow these steps to enable mutual TLS authentication and ACLs.

## Place yourself in the `deploy` folder
```
cd deploy
```
## Create a Kafka cluster with mutual TLS and authorization enabled
```
kubectl apply -f kafka-cluster-tls.yaml
```
## Create a topic
```
kubectl apply -f topic.yaml
```

## Create a producer user
```
kubectl apply -f producer-user.yaml
```
## Create a consumer user
```
kubectl apply -f consumer-user.yaml
```
## Generate the client-side material for mutual TLS authentication
### Make utility scripts executable
```
chmod a+x get_producer_keys.sh
chmod a+x get_consumer_keys.sh
```

## Connect to Kafka cluster using mutual-TLS-enabled Kafka clients
> You will need to install [Strimzi Kafka CLI](https://github.com/systemcraftsman/strimzi-kafka-cli)

> `brew tap systemcraftsman/strimzi-kafka-cli`

> `brew install strimzi-kafka-cli`
```
./get_producer_keys.sh
kfk console-producer --topic my-topic -n kafka -c my-cluster --producer.config client.properties

./get_consumer_keys.sh
kfk console-consumer --topic my-topic -n kafka -c my-cluster --consumer.config client.properties
```

> Run this command to view the Kafka broker logs
```
kubectl logs -f my-cluster-kafka-0 -c kafka -n kafka
```

