# PROYECTO 2

El proyecto 2 del curso Sistemas Operativos 1 consta de la implementacion de un visor en tiempo real de casos de covid19.

El flujo por el cual pasa esta aplicacion va desde la generacion de trafico por medio de locust, que representara los casos infectados reportados diariamente. Asi como tambien el monitoreo de los recursos transmitidos atraves de los diferentes componentes del cluster de kubernetes.

## Generador de trafico Locust

Para enviar el trafico se ingresa en la direccion proporcionada por el sistema al ejecutar el script. y se establecen los parametros correspondientes.

![locust](https://user-images.githubusercontent.com/37676214/103975283-5ff7e780-5139-11eb-81bd-370f8dc6c558.png)

Al momento de iniciar la insercion de trafico, se presentan unas metricas dnde se puede visualizar las peticiones realizadas asi como tambien el porcentaje de fallos presentes.

![locust1](https://user-images.githubusercontent.com/37676214/103975287-62f2d800-5139-11eb-8a9b-b7a1657ec47b.png)

## Panel Linkerd

En el area de linkerd se puede visualizar en la pantalla principal de namespaces las metricas que estan siendo realizadas.

![linkerd0](https://user-images.githubusercontent.com/37676214/103975249-4fe00800-5139-11eb-815f-3caeba3d5e03.png)

![linkerd1](https://user-images.githubusercontent.com/37676214/103975259-540c2580-5139-11eb-8ee0-3c440b45c896.png)

Al momento de ingresar a la metrica "project" en el partado de metricas  http, se podra visualizar los deplyments y pods que fueron implementados en el cluster de kubernetes, asi como los servicios correspondientes en el area de deployments y el estado de cada pod.

![linkerd2](https://user-images.githubusercontent.com/37676214/103975265-55d5e900-5139-11eb-8878-0aaa721a5b05.png)


En el area de Traffic Splits se podra ringresar en el servicio de api dummy para verificar la division de trafico actual.

![linkerd3](https://user-images.githubusercontent.com/37676214/103975270-579fac80-5139-11eb-99b9-a332bac709ef.png)

A continuación, se puede visualizar de forma grafica el trafico que viene de dummy que a su vez es divido en %50 para cada servicio, en este caso blue o green.

![linkerd5](https://user-images.githubusercontent.com/37676214/103975273-59697000-5139-11eb-8f53-3c57ce139e81.png)

## Página web

En la pagina web se puede visualizar los casos actualmente en la base de datos de mongodb como redis. Se divide en 5 apartados, los cuales son:
- Ultimos 5 casos
- Estados infectados
- Top 3 departamentos
- Porcentajes
- Todos los casos

A continuacion se presenta los ultimos 5 casos detectados.

![pagina0](https://user-images.githubusercontent.com/37676214/103975293-64bc9b80-5139-11eb-8226-7a5d3d410167.png)


En el siguiente apartado se presnetan los casos infectados clasificados en rango de edades, representados en una grafica de barras asi como tambien en una grafica de pie.

![pagina2](https://user-images.githubusercontent.com/37676214/103975299-66865f00-5139-11eb-8669-b3645a0ed641.png)

En el siguiente apartado se presneta el top 3 de departamenos con mayor numero de casos detectados, representados en una grafica de barras.

![pagina3](https://user-images.githubusercontent.com/37676214/103975302-68502280-5139-11eb-9b3c-007ccc49a43e.png)

Como siguiente, se presenta en graficas de pie los porcentajes de:
- Forma de contagio
- Estado de la persona
- Departamento

![pagina4](https://user-images.githubusercontent.com/37676214/103975311-6be3a980-5139-11eb-9078-ecaa64155472.png)

![pagina4 1](https://user-images.githubusercontent.com/37676214/103975309-6ab27c80-5139-11eb-9469-bb74df15e72d.png)


Como ultimo apartado, se presenta el listado completo de casos detectados.

![pagina5](https://user-images.githubusercontent.com/37676214/103975318-700fc700-5139-11eb-8781-a00a9b2db847.png)
