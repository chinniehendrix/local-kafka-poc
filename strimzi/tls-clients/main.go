package main

import (
	"context"
	"crypto/tls"
	"crypto/x509"
	"fmt"
	"io/ioutil"
	"time"

	log "github.com/sirupsen/logrus"

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
	logger := log.New()

	w := &kafka.Writer{
		Addr:        kafka.TCP("my-cluster-kafka-brokers:9093"),
		Topic:       "my-topic",
		Compression: kafka.Lz4,
		Transport: &kafka.Transport{
			TLS: tlsConfig(),
		},
		//Balancer: &kafka.Hash{},
		Logger: logger,
	}

	for i := 0; i < 1; i++ {
		key := fmt.Sprintf("Key-%d", i)

		kafkaMessage := &kafka.Message{
			Key:   []byte(key),
			Value: []byte(fmt.Sprintf("This is message %d", i)),
		}

		err := w.WriteMessages(context.Background(), *kafkaMessage)
		if err != nil {
			fmt.Println(err)
		} else {
			fmt.Println("produced", key)
		}

	}

	if err := w.Close(); err != nil {
		log.Fatal("failed to close writer:", err)
	} else {
		log.Info("Successfully closed writer")
	}

	time.Sleep(3600 * time.Second)
}
