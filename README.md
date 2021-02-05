# PROYECTO 2

El proyecto 2 del curso Sistemas Operativos 1 consta de la implementacion de un visor en tiempo real de casos de covid19.

El flujo por el cual pasa esta aplicacion va desde la generacion de trafico, con python y locust, que representara los casos infectados reportados diariamente hasta el consumo y consulta de los mismos en una pagina de react montada en nginx consumida por Google Cloud run. 

Se implementan diferentes fases transitorias de envio de datos de mensajeria en GRPC y Redis Pub/Sub utilizando el lenguaje Go; ademas de una api que ayuda a distribuir el trafico 50/50, haciendo un TraficSlit, todo esto orquestado en un cluster de Kubernetes, utilizando Linkerd para el monitoreo de los datos. 

Se utilizan 2 bases de datos, una NoSQL montada en un servidor atlas de MongoDB para almacenar todos los datos de los infectados y otra clave valor Redis montada en una maquina virtual de Google Cloud para realizar ciertos reportes.  

Para la actualizacion de los datos en el frontend se utilizaron funciones cloud de google y tambien funciones de WebSockets en NodeJs montadas en cloud run. 

Teniendo una arquitectura final como la siguiente:

![image](https://user-images.githubusercontent.com/37676214/103950701-f3fa8c80-5102-11eb-82a3-44e9824f1773.png)

Las partes descritas anteriormente se detallan adelante.

## Generador de trafico

El generador de trafico se construye apartir del lenguaje python que utiliza una libreria de locust para ejecutarse localmente. 

Ese generador consiste en el poder simular entradas de datos de personas infectadas los cuales posteriormente se distribuiran apartir de nginx a la api dummy la cual se encargara de hacer el trafic split entre el blue y green deployment.

Este generador de trafico toma datos aleatorios de un archivo llamado casos.json. y posteriormente los envia mediante peticiones post. 

El contenido de este script de python es el siguiente:

```sh
import time 
from locust import HttpUser, task
import json
import random

class QuickstartUser(HttpUser):
    casos = []
    with open('casos.json') as json_file:
        data = json.load(json_file)
        casos.extend(data)

    @task
    def insert_case(self):
        time.sleep(1)
        self.client.post("/",json=random.choice(self.casos))
```

En el cual se importan las librerias de 
1. "locust" para generar el trafico.
2. "json" para leer el archivo con los datos 
3. "random" para tomar datos aleatorios de un arreglo en el que se guardaran los datos del archivo de casos. 

Primero se ejecutan la lectura del archivo y la insercion de los datos del archivo en el arreglo, posteriormente se envian solicitudes con contenido aleatorio de la informacion del arreglo a la direccion "/" que se levantara con locust. 

Para ejecutar el script se utiliza el siguiente comando:

```sh
locust -f loadtest.py
```

Cabe destacar que se debe tener instalado locust. 

Para enviar el trafico se ingresa en la direccion proporcionada por el sistema al ejecutar el script. y se establecen los parametros correspondientes.

![image](https://user-images.githubusercontent.com/37676214/103959634-dedb2900-5115-11eb-9a1a-b0f88e5e8ae0.png)


## Nginx Ingress - Linkerd

### Instalacion de Linkerd

Seguir los pasos de la documentacion oficial

https://linkerd.io/2/getting-started/
```sh
#curl -sL https://run.linkerd.io/install | sh
#export PATH=$PATH:$HOME/.linkerd2/bin #add line to ~/.profile
#linkerd version
#linkerd check --pre
#linkerd install | kubectl apply -f -
```

### Instalacion Helm

```sh
wget https://get.helm.sh/helm-v3.2.4-linux-amd64.tar.gz
tar -xzvf [nombre_archivo_descargado]
sudo mv linux-amd64/helm /sbin
helm repo add stable 	https://charts.helm.sh/stable
helm search repo stable
```

Despues se crea un namespace con el nombre nginx-ingress
```sh
$ kubectl create ns nginx-ingress
```

Ahora Helm+Nginx Ingress
```sh
helm repo add ingress-nginx https://kubernetes.github.io/ingress-nginx 
helm repo update 
helm install nginx-ingress ingress-nginx/ingress-nginx -n nginx-ingress
```

### Inyectar Ingress
Una vez que ya hemos instalado nginx-ingress tenemos que inyectarlo. 

Primero obtenemos la ip que se le asigno 
```sh
$ kubectl get service -n nginx-ingress
```

Obtenemos el nombre del deploy que instalamos con helm 
```sh
$kubectl get deployments -n nginx-ingress
```

Con el nombre del deployment podemos inyectar el ingress configurando su archivo de configuracion

```sh
kubectl get deployment [NOMBRE_DEPLOYMENT]-n nginx-ingress -o yaml | linkerd inject --ingress - | kubectl apply -f -
```
 
Para verificar que el proceso se haya realizado correctamente se debe ingresar este comando 

```sh
kubectl describe pods [NOMBRE_POD] -n nginx-ingress | grep "linkerd.io/inject: ingress"
```

Obteniendo la siguiente respuesta

```sh
linkerd.io/inject: ingress
```
Con la direccion IP generada por el servicio ingress tenemos la creacion de 4 dominios los cuales nos permitiran el envio y recepcion de los datos

```sh
sopes1p2.tk
green.sopes1p2.tk
blue.sopes1p2.tk
dummy.sopes1p2.tk
```

## Api Dummy

La api dummy consiste en la creacion de un deployment en kubernetes basado en la misma imagen del Blue deployment, esta API sirve solamente como transitoria para el trafic split implementado en kubernetes.

## Blue Deployment

Esta compuesto por un framework para apis, llamado GRPC el cual cuenta con una comunicacion de cliente-servidor, donde el cliente se comunica al servidor y envia los datos por medio de un canal para ser procesados en el servidor y este mismo le envie una respuesta a cliente a cerca del estado final de la solicitud.
Por lo tanto, para lograr el despliegue y posterior conexion entre las dos partes de grpc en kubernetes, se utilzaron dos servicos:

### Blue

El servicio conlleva la implementacion de su funcionalidad como cliente grpc en el lenguaje Go, el cual se encarga de funcionar como un tipo de servidor alternativo para poder aceptar las solicitudes que provienen de la parte de API Dummy una vez aceptadas se envia dicha información hacia el servidor grpc el cual esta representado con un servicio llamado blue2.

Las librerias necesarias para su implementacion son las siguientes:

```sh
	"github.com/gorilla/mux"
	"google.golang.org/grpc"
```

### Blue 2

El servicio conlleva la implementacion de su funcionalidad como servidor grpc en el lenguaje Go, el cual se encarga aceptar las solicitudes provenientes del cliente grpc(blue). En esta implementacion se realizó la conexion a las bases de datos de mongodb Atlas y redis, ya que sel fin de esta parte es insertar los individuos infectados en mongodb, y en redis los ultimos 5 casos como tambien las edades de los mismos.

Las librerias necesarias para su implementacion son las siguientes:

```sh
	"google.golang.org/grpc"
	"github.com/gomodule/redigo/redis"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
```
Para tomar una idea del funcionamiento de grpc realizar el siguiente ejemplo presentando un hola mundo:
https://grpc.io/docs/languages/go/quickstart/

## Green Deployment

Este Deployment teorico en realidad consta de 2 deployments, uno que es green1 en el cual se hace la implementacion de publicar en un canal de la base de datos redis y otro green2 que esta solamente suscrito a ese canal, esperando la informacion que envia green1 para poder hacer la insercion correspondiente en la base de datos. 

### Green 1 

Esta parte de la implementacion se basa en una aplicacion en lenguaje Go la cual se encarga de publicar en un canal de Redis la informacion correspondiente a los nuevos infectados. Posteriormente se encarga de insertar los datos como edades y los ultimos 5 infectados a una lista para que se puedan obtener reportes del mismo; al terminar este proceso queda esperando nuevos mensajes que en este caso serian nuevos casos infectados. 

El algoritmo que sigue es el siguiente:

1. Espera informacion.
2. Recibe informacion.
3. Abre conexion con Redis.
4. Publica informacion en canal Redis.
5. Inserta en una lista de la base de datos de redis la edad de la persona.
6. Actualiza la lista de ultimos 5 casos infectados. 
7. Cierra conexion con base de datos.
8. Regresa al paso 1. 

Esta aplicacion fue montada en un contenedor distroless Golang, para su posterior implementacion en el deployment de kubernetes. 

Las librerias necesarias para su implementacion son las siguientes:

```sh
	"github.com/gomodule/redigo/redis"
	"github.com/gorilla/mux"
```

### Green 2 

En cuanto a la segunda parte de la implementacion del Green deployment tenemos una aplicacion en lenguaje Go que sera la encargada de suscribirse al canal de comunicacion establecido por la aplicacion de Green 1 para recibir la informacion, pero tambien insertar los datos que llegan en la base de datos NoSQL.

El algoritmo que sigue la aplicacion en Green 2 es el siguiente:

1. Se establece comunicacion con la base de datos.
2. Se suscribe al canal de comunicacion.
3. Si hay mensaje nuevo ir paso 4 sino paso 3.
4. Establecer conexion con base de datos NoSQL.
5. Insertar informacion en base de datos NoSQL.
6. Cerrar conexion con base de datos NoSQL.
7. Ir paso 3.

Al igual que la implementacion Green1 esta aplicacion fue empaquetada en un contenedor, para su posterior Deployment en el cluster de kubernetes. 

Las librerias a utilizar para su conexion con las bases de datos fueron:

```sh
	"github.com/gomodule/redigo/redis"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
```
## MongoDB
Para la generación de la Base de datos en MongoDB se utilizo el sitio:

```sh
	"https://www.mongodb.com/cloud/atlas"	
```
En el que los pasos fueron los siguientes:

-   Registrarse con un correo y contraseña
-   Seleccionar la opcion para cuenta gratuita
-   verificar datos y correo electronico mediante correo de confirmación

Para la creación de la base de datos como tal los pasos fueron los siguientes:
-   Se creó un cluster en la página
-   Dentro del cluster se creó una base de datos asociada al cluster que se usaria
-   Se generó una colección (que es donde se almacena la iformación en mongodb), con la siguiente estructura

```sh
	[
        {
            name:"Pablo Mendoza"
            location:"Guatemala City"
            age:35
            infected_type:"communitary"
            state: "asymptomatic"
        }
    ]
```

Luego de eso procedió a generarse la cadena de conexión que sera utilizada para la interacción de los diferentes servicios que estarán asociados a la base de datos, siendo la cadena una estructura como esta;

```sh
	"mongodb+srv://admin_sopes:<password>@datoscorona.nj92e.mongodb.net/<dbname>?retryWrites=true&w=majority"
```

## Redis - Ubuntu

Para instalar redis en una distribucion de Ubuntu ejecutar el siguiente comando. 

```sh
$ sudo apt-get install redis-server
```

Para modificar password y permitir al exterior hay que modificar el archivo de configuracionn redis.conf

```sh
$ sudo nano /etc/redis/redis.conf
```

Buscar linea con "requierepass", quitarle el comentario y definir la contraseña.

Para permitir al exterior buscar la linea "bind 127.0.0.1::1" y comentarla.
```sh
requierepass [NUEVA_CONTRASEÑA]
```

Reiniciar el servidor de redis para aplicar los cambios. 

```sh
$ sudo /etc/init.d/redis-server stop
$ sudo /etc/init.d/redis-server start
```

Para entrar al cliente de redis en la consola colocamos el siguiente comando.

```sh
$ redis-cli
```
Posteriormente como modificamos para definir un password nos pedira que nos autentiquemos, esto lo logramos a traves de la contraseña que definimos anteriormente.

```sh
[IP:PUERTO]> auth [NUESTRA_CONTRASEÑA]
```
En este punto ya podremos manejar nuestros datos con redis, y realizar las operaciones que necesitemos. 

## Introduccion de comandos basicos de redis

1. Para salir de redis 

```sh
[IP:PUERTO]> exit
```
 
 2. Para seleccionar una base de datos.
 
```sh
[IP:PUERTO]> select [index_db]
[IP:PUERTO][index_db_seleccionada]> 
```

3. Para ingresar un valor

```sh
[IP:PUERTO][index_db_seleccionada]>set [clave] [valor] 
```

4. Obtener un valor ingresado

```sh
[IP:PUERTO][index_db_seleccionada]>get [clave] 
```

## Conexion a Redis usando Python 

El codigo necesario para conectarse a Redis utilizando python es el siguiente

```sh
import redis

pool = redis.ConnectionPool(host="[DIRECCION_IP]", port=[NUMERO_PUERTO], password = "[password]", db=[index_db], decode_responses = True)
r = redis.Redis(connection_pool = pool)

#val = r.get("a")   para obtener un valor 
#print(val)         imprimir ese valor
```

## Serveless Functions

Las funciones estan hechas en google cloud functions y sirven para obtener la informacion de las listas de edades y ultimos 5 casos de contagios. Estas funciones estan hechas en lenguaje python. Y se utiliza la libreria redis. 

Estas funciones siguen el siguiente algoritmo simple.

1. Se crea la conexion con Redis.
2. Se obtienen los datos de las listas.
3. Se insertan los cors al response.
4. Se retorna el response. 

Las cors son una parte importante en la funcion, ya que sin ellas ocurre un problema y no se puede obtener la respuesta deseada. 

El metodo para insertar evitar el problema de cors es el siguiente en lenguaje Python:
```sh
    if request.method == 'OPTIONS':
        headers = {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET',
            'Access-Control-Allow-Headers': 'Content-Type',
            'Access-Control-Max-Age': '3600'
        }

        return ('', 204, headers)

    headers = {
        'Access-Control-Allow-Origin': '*'
    }
    return (retorno, 200, headers)
```

Cabe resaltar que para realizar la conexion con redis desde cualquier parte hay que tener 3 elementos:

1. Direccion ip de la maquina virtual donde se encuentra la base de datos.
2. Puerto por el que se accede.
3. Contraseña para autenticarse en Redis-cli

Para mas informacion acerca de la libreria que se utilizo para conectarse desde python a redis visitar:  https://github.com/andymccurdy/redis-py


## NodeJS
Para la creación del servidor de NodeJs se deben tener en consideración distintos aspectos, como lo tienen que ser que el equipo en el que se desarrolla cuente con las tecnologías necesarias para poder soportar este servidor.

Comenzando con la instalación de los paquetes de nodejs y npm, de la siguiente manera

-   #### Instalación de Node
    Para la instalación de Node, se realizó lo siguiente:
    ```sh
	    $   sudo apt-get update
        $   sudo apt install nodejs
        $   nodejs --version   
    ```

-   #### Instalación de gestor de paquetes npm
    Para la instalación de npm, se realizó lo siguiente:
    ```sh
	    $   sudo apt-get update
        $   sudo apt install npm
        $   npm --version   
     ```
-   #### Desarrollo del servidor

Para la creación del servidor se realizo la inicialización del proyecto:
    ```sh
	    $   npm init --yes   
    ```

Para crear los elementos iniciales del proyecto, como el <<package.json>>

Dentro de este archivo se anotaron las dependencias que son necesarias para el funcionamiento del proyecto, siendo las necesarias finalmente las siguientes y quedando estructurado de la siguiente manera:

    ```sh
	    {
         "name": "Node_Mongo",
         "version": "1.0.0",
         "description": "",
         "main": "index.js",
         "scripts": {
            "start": "nodemon server/index.js"
         },
         "keywords": [],
         "author": "",
         "license": "ISC",
         "dependencies": {
         "express": "^4.17.1",
         "mongodb": "^3.6.3",
         "mongoose": "^5.11.10",
         "socketio": "^1.0.0"
         },
         "devDependencies": {
             "nodemon": "^2.0.6"
         }
        }  
    ```


Luego se procedió a la creación del documento <<index.js>> que será el archivo en el cual se llevará a cabo el desarrollo de todos los servicios necesarios para el funciomiento del servidor que se esta realizando.

Dentro de este archivo se inicio con la creación de un servidor con express

```sh
	var express = require('express');
    const { Server } = require('http');
    var app = express();   

   app.listen(8000,function(){
    console.log('servidor corriendo en el puerto 8000');
    });   

```
Para la conexion externa con el servidor fue necesario la utilización de cors, que son los que permiten el ingreso y salida de distintos accesos al servidor con los distintos metodos de ingreso y egreso del servidor

```sh

	app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
   res.setHeader(
   "Access-Control-Allow-Headers",
   "Origin, X-Requested-With, Content-Type, Accept, Authorization, AuthorizationReporter"
      );
   res.setHeader(
   "Access-Control-Allow-Methods",
   "GET, POST, PATCH, PUT, DELETE, OPTIONS"
   );
  next();
  });  

```
Se realizo la conexion con el cluster de mongodb atlas para poder acceder a consultar los datos que se encuentran en la misma, esto de la siguiente manera:

```sh

    const MongoClient = require('mongodb').MongoClient;
    const connectionString = 'mongodb+srv://<USER>:<PASS>@<CLUSTER>.nj92e.mongodb.net/<DB_Connect>?retryWrites=true&w=majority';

	MongoClient.connect(connectionString, { useUnifiedTopology: true })
        .then(client => {
        console.log('Connected to Database')
        client.close();
  })
  .catch(error => console.error(error));


```

Para la obtencion de los datos de la coleccion creada para el proyecto se desarrollo un metodo de tipo <<get>> en el cual se utilizo la propiedad <<collection.find()>> para poder listar los datos que se encuentran en esa colección y mostrarlos en formato json para el consumo desde una app externa.

```sh

    //Datos generales
app.get('/datoscorona',function(req,res){
    MongoClient.connect(connectionString, { useUnifiedTopology: true })
  .then(client => {
    const db = client.db('dbsopes')
    const quotesCollection = db.collection('datoscorona')//cambio para datos de corona
    db.collection('datosCorona').find().toArray()
    .then(results =>{
        console.log(contador ++);
        client.close();
        return res.status(200).send(results);
    })
  })
  .catch(error => console.error(error))
});


```
De la misma manera se realizó la obtencion de datos para los distintos filtrados que se realizaron de acuerdo a la necesidad que se tenía de la utilizacion de cada uno de los datos que fueran a ser visualizados en el frontend, para esto usando la propiedad <<collection().agregate({'filtro'})>> y <<collection().agregate({'filtro'}).limit('valor_numerico')>>  mostrando los datos necesarios para cada tipo de solicitud, de la siguiente manera:

```sh

//Datos por departamento
app.get('/topDeptos', function(req,res){
    MongoClient.connect(connectionString, { useUnifiedTopology: true })
  .then(client => {
    const db = client.db('dbsopes')
    const quotesCollection = db.collection('datoscorona')//cambio para datos de corona
    
    const datos =  db.collection('datosCorona').aggregate([{$group: {_id:"$location",contador: {$sum:1}}},{$sort:{contador:-1}}]).limit(3).toArray()
    .then(datos =>{
      console.log(contador ++);
        client.close();
        return res.status(200).send(datos);
    });   
    //console.log(datos);  
    
  })
  .catch(error => console.error(error))
});

app.get('/datosEstados', function(req,res){
    MongoClient.connect(connectionString, { useUnifiedTopology: true })
  .then(client => {
    const db = client.db('dbsopes')
    const quotesCollection = db.collection('datoscorona')//cambio para datos de corona
    
    const datos =  db.collection('datosCorona').aggregate([{$group: {_id:"$infected_type",contador: {$sum:1}}},{$sort:{contador:-1}}]).toArray()
    .then(datos =>{
      console.log(contador ++);
        client.close();
        return res.status(200).send(datos);
    });   
    //console.log(datos);  
    
  })
  .catch(error => console.error(error))
});


```


## FrontEnd - React

El frontend sirve para maquetar los datos almacenados tanto en las listas de redis, como en la coleccion de mongodb.  Estos datos se obtienen a partir de las funciones serveless y de los sockets de nodejs. 

El frontend esta hecho a traves de las librerias de ReactJS. 

Los comandos para crear el proyecto son: 

```sh
npx create-react-app [NOMBRE_APP]
cd [NOMBRE_APP]
npm start
```

para inicializar un proyecto que ya esta hecho se utiliza:

```sh
npm install
npm start
```
para instalar las dependencias e iniciar el proyecto. 

Este proyecto cuenta con un solo componente almacenado en App.js

Tambien se utiliza Boostrap 4, en su tema Lux, para el diseño del mismo; este se importa en index.html:

```sh
<link rel="stylesheet" href="https://bootswatch.com/4/lux/bootstrap.min.css">
```

Para el diseño de la grafica se utiliza la libreria Chartlist y se incorpora en el index dentro de la etiqueta head de la siguiente forma: 

```sh
<link rel="stylesheet" href="//cdn.jsdelivr.net/chartist.js/latest/chartist.min.css">
```

Adicional a eso tambien hay que importar la libreria dentro de App.js para su uso dentro del componente que se creo para la maquetacion de los datos:

```sh
import ChartistGraph from 'react-chartist';
```

El algoritmo de la pagina de frontend es el siguiente.

1. Se construye la pagina.
2. Carga elementos principales. 
3. Hace solicitudes a Nodejs y a las funciones serveless
4. Con la informacion obtenida del paso 3 se actualiza los datos del estado del componente y los presenta visualmente.
5. Espera 5 segundos.
6. Regresa al paso 3. 

Las solicitudes a para obtener informacion se hacen a traves del metodo fetch mediante la estructura siguiente:

```sh
      fetch(this.url_funcion).then(res => {
         return res.text()
      }).then((dat) => {
      	 //CON LOS DATOS OBTENIDOS(dat) ACTUALIZAR LA INFORMACION DEL ESTADO DEL COMPONENTE
      }
```

La estructura para activar las solicitudes cada cierto intervalo del tiempo esta dada de la siguiente forma:

```sh
   initInterval(e) {
      console.log("Recargando...");
      this.intervalGraphics = setInterval(() => {
         this.req()
      }, 5000)
   }
```
Donde this.req() es el metodo donde se ejecutan los fetch y 5000 es el tiempo en milisegundos que tarda el intervalo en volver a ejecutar la funcion.

En terminos de desarrollo la aplicacion se prueba en el localhost puerto 3000 con: 

```sh
npm start
```

sin embargo en terminos de produccion se empaqueto la aplicacion en un contenedor distroless de node en la version 12, pero en este mismo contenedor se libera la aplicacion con nginx en el puerto 80 del contenedor. 

## Creacion del cluster de kubernetes

Para crear el cluster de kubernetes desde la terminal local se debe instalar gcloud asi tambien kubectl.
### Instalacion kubectl

Se puede acceder a la documentacion oficial: https://kubernetes.io/docs/tasks/tools/install-kubectl/ o bien ejecutar los siguientes comandos. 
```sh

wget curl -LO https://storage.googleapis.com/kubernetes-release/release/v1.18.0/bin/linux/amd64/kubectl

chmod +x ./kubectl

sudo mv ./kubectl /usr/local/bin/kubectl

```
Para crear el cluster de kubernetes hay que tener instalado gcloud si se desea hacerlo desde la terminal local, aunque tambien se puede hacer desde la consola que proporciona google cloud.

Para la creacion de este cluster se utilizaron los servicios proporcionados por google cloud. 

```sh

gcloud config set project yourproject

gcloud config set compute/zone us-central1-a

gcloud container clusters create k8s-demo --num-nodes=1 --tags=allin,allout --enable-legacy-authorization --enable-basic-auth --issue-client-certificate --machine-type=n1-standard-2 --no-enable-network-policy

```
1. Se configura el proyecto en el cual lanzaremos el cluster.
2. Se configura la zona en la cual estara el mismo.
3. Se crea el cluster. 

## Adicional

### Crear una imagen de docker

Una vez tenemos el archivo Dockerfile seguir estos comandos

```sh
docker login 	

docker build -t [NOMBRE_PARA_IMAGEN] .

docker tag [NOMBRE_IMAGEN] [USUARIO_DOCKERHUB]/[NOMBRE_IMAGEN]

docker push [USUARIO_DOCKERHUB]/[NOMBRE_IMAGEN]

```
1. Iniciar sesion de dockerhub
2. Construir imagen
3. Etiquetar la imagen
4. Subir la imagen a tu repositorio de DockerHub

### Levantar Imagen creada

```sh
docker run -it -d -p 8888:80 --name=[NOMBRE_PARA_INSTANCIA_IMAGEN] [USUARIO_DOCKERHUB]/[NOMBRE_IMAGEN]
```
en el comando anterior se obserta el -d para ejecutar en modo demonio (ejecutar en segundo plano), -p para hacer puente ente los puertos de la maquina y los del contenedor 8888->80.

### Ejemplo contenido de Dockerfile

Este ejemplo indica como construir una aplicacion de react en una imagen de docker. 

```sh
FROM node:12-alpine3.12 AS build
WORKDIR /app
COPY package.json ./
RUN npm install
COPY . . 
RUN npm run build

##PASO 2
FROM nginx:1.19.0-alpine AS prod-stage
COPY --from=build /app/build /usr/share/nginx/html
EXPOSE 80 
CMD ["nginx","-g", "daemon off;"]
```
#### Explicacion:

##### Paso 1: se crea el build de react

1. Se utilizara node en la imagen y se le colocara un alias el cual sera build.
2. El directorio de trabajo del contenedor sera /app
3. Se copia el package.json en la raiz del contenedor.
4. Se instalan las dependencia.
5. Se copia todo lo que aparecio de npm install a nuestra carpeta. 
6. Se construye la aplicacion de react.

##### Paso 2: Creacion de servidor con nginx

7. Se utiliza nginx y se pone el alis prod-stage
8. Se copia desde el build(alias) el contenido de /app/build en /usr/share/nginx/html
9. Se expone el puerto 80.
10. Se corren los comandos de nginx 
