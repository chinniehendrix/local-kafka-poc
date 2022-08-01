# Go image for building the project
FROM golang:alpine as builder

ENV GOBIN=$GOPATH/bin
ENV GO111MODULE="on"

RUN mkdir /app
WORKDIR /app

COPY go.* /app
COPY main.go /app

RUN go build .

ENTRYPOINT ["/app/local-kafka-poc"]