# Local Kafka PoC

This is a quick and dirty PoC to be able to experiment and troubleshoot issues with Kafka 2.4.1. There are two flavors of this local PoC (1) using Confluent Kafka K8s manifests and (2) using Strimzi.

## Software Prerequisites
* Minikube: allows you to run a local Kubernetes cluster
```
brew install minikube
```
* Docker: a container engine
```
brew install docker
```
* Skaffold: streamlines local development for K8s
```
brew install skaffold
```