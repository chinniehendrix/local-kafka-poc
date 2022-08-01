package main

import (
	"context"
	"crypto/tls"
	"crypto/x509"
	"fmt"
	"io/ioutil"
	"log"
	"time"

	"github.com/segmentio/kafka-go"
)

func tlsConfig() *tls.Config {
	userCert, errCert := ioutil.ReadFile("/client-certs/user.crt")
	if errCert != nil {
		log.Fatal(errCert)
	}

	userKey, errKey := ioutil.ReadFile("/client-certs/user.key")
	if errKey != nil {
		log.Fatal(errKey)
	}

	caPEM, errCA := ioutil.ReadFile("/ca-certs/ca.crt")
	if errCA != nil {
		log.Fatal(errCA)
	}

	cert, err := tls.X509KeyPair(userCert, userKey)
	if err != nil {
		log.Fatal(err.Error())
	}

	caCertPool := x509.NewCertPool()
	caCertPool.AppendCertsFromPEM([]byte(caPEM))

	config := &tls.Config{
		MinVersion:   tls.VersionTLS12,
		Certificates: []tls.Certificate{cert},
		RootCAs:      caCertPool,
	}

	fmt.Println("Returning TLS config")
	return config
}

func main() {
	now := time.Now()
	fmt.Println("Go client started")
	fmt.Println(now)

	dialer := &kafka.Dialer{
		Timeout:   time.Second * 10,
		DualStack: true,
		TLS:       tlsConfig(),
	}

	// to produce messages
	topic := "my-topic"
	partition := 0

	conn, err := dialer.DialLeader(context.Background(), "tcp", "my-cluster-kafka-brokers:9093", topic, partition)
	if err != nil {
		log.Fatal("failed to dial leader:", err)
	}

	conn.SetWriteDeadline(time.Now().Add(10 * time.Second))
	_, err = conn.WriteMessages(
		kafka.Message{Value: []byte("one!")},
		kafka.Message{Value: []byte("two!")},
		kafka.Message{Value: []byte("three!")},
	)

	if err != nil {
		log.Fatal("failed to write messages:", err)
	} else {
		fmt.Println("Produced 3 messages")
	}

	if err := conn.Close(); err != nil {
		log.Fatal("failed to close writer:", err)
	}

	time.Sleep(3600 * time.Second)
}
