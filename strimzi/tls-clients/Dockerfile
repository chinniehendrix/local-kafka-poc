# Go image for building the project
FROM golang:1.18.5-alpine3.15

ENV GOBIN=$GOPATH/bin
ENV GO111MODULE="on"

RUN mkdir /app
WORKDIR /app

COPY go.* /app
COPY main.go /app

RUN go version
RUN go build .

ENTRYPOINT ["/app/local-kafka-poc"]