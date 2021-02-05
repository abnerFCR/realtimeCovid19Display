FROM golang:1.12.0-alpine3.9
RUN mkdir /app
ADD . /app
WORKDIR /app

RUN apk update
RUN apk add git

RUN go get "github.com/gomodule/redigo/redis"
RUN go get "go.mongodb.org/mongo-driver/bson"
RUN go get "go.mongodb.org/mongo-driver/mongo"
RUN go get "go.mongodb.org/mongo-driver/mongo/options"

EXPOSE 5000

RUN go build -o sub . 
CMD ["/app/sub"]
