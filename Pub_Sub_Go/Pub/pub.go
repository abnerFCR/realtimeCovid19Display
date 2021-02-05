package main

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
	"strconv"

	"github.com/gomodule/redigo/redis"
	"github.com/gorilla/mux"
)

//Persona se exporta
type Persona struct {
	Name         string `json:"name"`
	Location     string `json:"location"`
	Age          int32  `json:"age"`
	InfectedType string `json:"infected_type"`
	State        string `json:"state"`
}

func postInfectado(res http.ResponseWriter, req *http.Request) {
	//https://godoc.org/github.com/gomodule/redigo/redis#Pool
	fmt.Println("Hello World")

	c, err := redis.Dial("tcp", "35.239.202.172:6379")
	if err != nil {
		log.Println(err)
	} else {
		log.Println("Todo esta Bien!!!")
	}

	defer c.Close()
	body, errReq := ioutil.ReadAll(req.Body)
	if errReq != nil {
		log.Println(err)
	} else {
		fmt.Println("correcto!")
		fmt.Println(req.Body)
		fmt.Println(body)
	}

	var personita Persona
	json.Unmarshal(body, &personita)

	/// This is for Publisher
	c.Do("AUTH", "ContraSOPES1")
	p, err2 := json.Marshal(personita)
	if err2 != nil {
		fmt.Println(err2)
	}
	c.Do("PUBLISH", "example", p)
	/// End Publish

	/// Ultimos 5 casos infectados
	tam, errtam := c.Do("LLEN", "lista")
	if errtam != nil {
		fmt.Println(errtam)
	} else {
		fmt.Println(tam)
		var tamanio int64
		tamanio = tam.(int64)
		if tamanio == 5 {

			popRed, errPop := c.Do("LPOP", "lista")
			if errPop != nil {
				fmt.Println("Error al eliminar el anterior")
				fmt.Println(errPop)
			} else {
				fmt.Println("Eliminando Anterior")
				log.Println(popRed)
			}
		}
		insersion := "Nombre:" + personita.Name + ":Locacion:" + personita.Location + ":Edad:" + strconv.FormatInt(int64(personita.Age), 10) + ":FormaContagio:" + personita.InfectedType + ":Estado:" + personita.State
		pushRed, errPush := c.Do("RPUSH", "lista", insersion)
		if errPush != nil {
			fmt.Println(errPush)
			fmt.Println("Error al insertar!")
		} else {
			fmt.Println("Se inserto correctamente")
			log.Println(pushRed)
		}

	}
	/// End here

	/// Edades de infectados
	pushRedEdad, errPushEdad := c.Do("LPUSH", "edades", strconv.FormatInt(int64(personita.Age), 10))
	if errPushEdad != nil {
		fmt.Println(errPushEdad)
	} else {
		log.Println(pushRedEdad)
	}
	/// End here

}
func main() {

	router := mux.NewRouter()

	router.HandleFunc("/postInfectado", postInfectado).Methods("GET", "OPTIONS")

	fmt.Println("El servidor esta escuchando en el puerto 5000")
	http.ListenAndServe(":5000", router)
}


