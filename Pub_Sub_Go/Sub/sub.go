package main

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"time"

	"github.com/gomodule/redigo/redis"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

//Persona se exporta
type Persona struct {
	Name          string `json:"name"`
	Location      string `json:"location"`
	Age           int32  `json:"age"`
	Infected_Type string `json:"infected_type"`
	State         string `json:"state"`
}

func insertar(personita Persona) {
	client, err := mongo.NewClient(options.Client().ApplyURI("mongodb+srv://admin_sopes:sopes1@datoscorona.nj92e.mongodb.net/dbsopes?retryWrites=true&w=majority"))
	if err != nil {
		log.Fatal(err)
	}
	ctx, _ := context.WithTimeout(context.Background(), 10*time.Second)
	err = client.Connect(ctx)
	if err != nil {
		log.Fatal(err)
	}
	defer client.Disconnect(ctx)

	dbsopes := client.Database("dbsopes")
	infectadosCollection := dbsopes.Collection("datosCorona")

	//infectadosResult, err2 := infectadosCollection.InsertOne(ctx, personita)

	infectadosResult, err2 := infectadosCollection.InsertOne(ctx, bson.D{
		{Key: "name", Value: personita.Name},
		{Key: "location", Value: personita.Location},
		{Key: "age", Value: personita.Age},
		{Key: "infected_type", Value: personita.Infected_Type},
		{Key: "state", Value: personita.State},
	})

	if err2 != nil {
		fmt.Println(err2)
	} else {
		fmt.Printf("Se insertaron %v documentos en la coleccion\n", infectadosResult)
	}
}

func main() {
	//https://godoc.org/github.com/gomodule/redigo/redis#Pool
	fmt.Println("Hello World")

	c, err := redis.Dial("tcp", "35.239.202.172:6379")
	if err != nil {
		log.Println(err)
	} else {
		log.Println("Everything is fine!!!")
	}
	c.Do("AUTH", "ContraSOPES1")
	/// This code is for Subscriber
	psc := redis.PubSubConn{Conn: c}
	psc.Subscribe("example")
	for {
		switch v := psc.Receive().(type) {
		case redis.Message:
			var personaNueva Persona
			json.Unmarshal(v.Data, &personaNueva)
			fmt.Println(personaNueva.Name)
			//insertar(personaNueva)
			client, err := mongo.NewClient(options.Client().ApplyURI("mongodb+srv://admin_sopes:sopes1@datoscorona.nj92e.mongodb.net/dbsopes?retryWrites=true&w=majority"))
			if err != nil {
				log.Fatal(err)
			}
			ctx, _ := context.WithTimeout(context.Background(), 10*time.Second)
			err = client.Connect(ctx)
			if err != nil {
				log.Fatal(err)
			}
			defer client.Disconnect(ctx)

			dbsopes := client.Database("dbsopes")
			infectadosCollection := dbsopes.Collection("datosCorona")

			infectadosResult, err2 := infectadosCollection.InsertOne(ctx, personaNueva)

			if err2 != nil {
				fmt.Println(err2)
			} else {
				fmt.Printf("Se insertaron %v documentos en la coleccion\n", infectadosResult)
			}
		case redis.Subscription:
			fmt.Printf("%s: %s %d\n", v.Channel, v.Kind, v.Count)
		case error:
			fmt.Println(v)
		}
	}
	/// End here
}
