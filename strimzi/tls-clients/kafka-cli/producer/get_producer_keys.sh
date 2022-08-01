#!/usr/bin/env bash

rm producer-truststore.jks producer-user.p12

kubectl get secret test-producer-01 -o jsonpath='{.data.user\.crt}' -n kafka | base64 -d > producer-user.crt
kubectl get secret test-producer-01 -o jsonpath='{.data.user\.key}' -n kafka | base64 -d > producer-user.key
kubectl get secret my-cluster-cluster-ca-cert -o jsonpath='{.data.ca\.crt}' -n kafka | base64 -d > ca.crt

echo "yes" | keytool -import -trustcacerts -file ca.crt -keystore producer-truststore.jks -storepass 123456
RANDFILE=/tmp/.rnd openssl pkcs12 -export -in producer-user.crt -inkey producer-user.key -name my-user -password pass:123456 -out producer-user.p12

rm producer-user.crt producer-user.key ca.crt