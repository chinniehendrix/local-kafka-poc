#!/usr/bin/env bash

rm consumer-truststore.jks consumer-user.p12

kubectl get secret test-consumer-01 -o jsonpath='{.data.user\.crt}' -n kafka | base64 -d > consumer-user.crt
kubectl get secret test-consumer-01 -o jsonpath='{.data.user\.key}' -n kafka | base64 -d > consumer-user.key
kubectl get secret my-cluster-cluster-ca-cert -o jsonpath='{.data.ca\.crt}' -n kafka | base64 -d > ca.crt

echo "yes" | keytool -import -trustcacerts -file ca.crt -keystore truststore.jks -storepass 123456
RANDFILE=/tmp/.rnd openssl pkcs12 -export -in user.crt -inkey user.key -name my-user -password pass:123456 -out consumer-user.p12

rm consumer-user.crt consumer-user.key ca.crt