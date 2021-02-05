/*
 *
 * Copyright 2015 gRPC authors.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

// Package main implements a server for Greeter service.
package main

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net"
	"strconv"
	"time"

	"google.golang.org/grpc"
	pb "google.golang.org/grpc/examples/helloworld/helloworld"

	"github.com/gomodule/redigo/redis"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type casoJSON struct {
	Name          string `json: "name"`
	Location      string `json: "location"`
	Age           int    `json: "age"`
	Infected_Type string `json: "infected_type"`
	State         string `json: "state"`
}

const (
	port = ":50051"
)

// server is used to implement helloworld.GreeterServer.
type server struct {
	pb.UnimplementedGreeterServer
}

// SayHello implements helloworld.GreeterServer
func (s *server) SayHello(ctx context.Context, in *pb.HelloRequest) (*pb.HelloReply, error) {
	//log.Printf("Received1: %v", in.GetName())

	// Conexion a mongodb
	data := in.GetName()
	info := casoJSON{}
	json.Unmarshal([]byte(data), &info)

	client, err := mongo.NewClient(options.Client().ApplyURI("mongodb+srv://admin_sopes:sopes1@datoscorona.nj92e.mongodb.net/dbsopes?retryWrites=true&w=majority"))
	if err != nil {
		//log.Printf(err)
	}
	ctx2, _ := context.WithTimeout(context.Background(), 10*time.Second)
	err = client.Connect(ctx2)
	if err != nil {
		//log.Printf(err)
	}
	defer client.Disconnect(ctx2)
	quickstartDatabase := client.Database("dbsopes")
	podcastsCollection := quickstartDatabase.Collection("datosCorona")

	podcastResult, err := podcastsCollection.InsertOne(ctx2, info)

	if err != nil {
		//log.Printf(err)
	}
	fmt.Println(podcastResult.InsertedID)

	// Conexion a redis
	c, err := redis.Dial("tcp", "35.239.202.172:6379")
	if err != nil {
		log.Println(err)
	} else {
		log.Println("Todo esta Bien!!!")
	}
	c.Do("AUTH", "ContraSOPES1")

	/// Ultimos 5 casos infectados
	tam, errtam := c.Do("LLEN", "lista")
	if errtam != nil {
		fmt.Println(errtam)
	} else {
		fmt.Println(tam)
		var tamanio int64
		tamanio = tam.(int64)
		if tamanio == 5 {
			fmt.Println("Eliminando Anterior")
			popRed, errPop := c.Do("LPOP", "lista")
			if errPop != nil {
				fmt.Println(errPop)
			} else {
				log.Println(popRed)
			}
		}
		insersion := "Nombre:" + info.Name + ":Locacion:" + info.Location + ":Edad:" + strconv.FormatInt(int64(info.Age), 10) + ":FormaContagio:" + info.Infected_Type + ":Estado:" + info.State
		pushRed, errPush := c.Do("RPUSH", "lista", insersion)
		if errPush != nil {
			fmt.Println(errPush)
		} else {
			log.Println(pushRed)
		}

	}
	/// End here

	/// Edades de infectados
	pushRedEdad, errPushEdad := c.Do("LPUSH", "edades", strconv.FormatInt(int64(info.Age), 10))
	if errPushEdad != nil {
		fmt.Println(errPushEdad)
	} else {
		log.Println(pushRedEdad)
	}
	/// End here

	// Respuesta al cliente grpc
	return &pb.HelloReply{Message: "Servidor recibio la informacion correctamente."}, nil
}

func main() {
	lis, err := net.Listen("tcp", port)
	if err != nil {
		//log.Printf("failed to listen: %v", err)
	}
	s := grpc.NewServer()
	pb.RegisterGreeterServer(s, &server{})
	if err := s.Serve(lis); err != nil {
		//log.Printf("failed to serve: %v", err)
	}
}
