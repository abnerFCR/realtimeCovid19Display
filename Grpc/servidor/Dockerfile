FROM golang:1.12.0-alpine3.9
RUN mkdir /app
ADD . /app
WORKDIR /app

RUN apk update
RUN apk add git

RUN go get "github.com/gomodule/redigo/redis"
RUN go get "github.com/golang/protobuf/proto"
RUN go get "google.golang.org/grpc"
RUN go get "google.golang.org/protobuf/cmd/protoc-gen-go"
RUN go get "google.golang.org/grpc/cmd/protoc-gen-go-grpc"
RUN go get "go.mongodb.org/mongo-driver/mongo"
RUN go get "go.mongodb.org/mongo-driver/mongo/options"

EXPOSE 50051

RUN go build -o main . 
CMD ["/app/main"]