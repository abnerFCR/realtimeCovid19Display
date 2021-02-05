import React, { Component } from 'react';
import './App.css';
import ChartistGraph from 'react-chartist';
import request from 'superagent'
import { SSL_OP_SSLEAY_080_CLIENT_DH_BUG } from 'constants';

class App extends Component {

   url_funcion_edades  =    'https://us-central1-proyecto2so1-300118.cloudfunctions.net/redis-edades'
   url_funcion_ultimos =    'https://us-central1-proyecto2so1-300118.cloudfunctions.net/redis-lista'
   url_topDeptos =          "https://nodejs-2tztl5tkha-uc.a.run.app/topDeptos"
   url_grafica_infectados = "https://nodejs-2tztl5tkha-uc.a.run.app/datosEstados"
   url_grafica_estados =    "https://nodejs-2tztl5tkha-uc.a.run.app/datosEstado"
   url_grafica_edad =       "https://nodejs-2tztl5tkha-uc.a.run.app/datosEdad"
   url_grafica_deptos =     "https://nodejs-2tztl5tkha-uc.a.run.app/datosDepto"
   url_todos          =     "https://nodejs-2tztl5tkha-uc.a.run.app/datoscorona"
   obj = {
      method: 'GET',
      headers: {
         "Accept": 'application/json',
         "Content-Type": 'application/json',
         //"Access-Control-Allow-Origin": "*",
         //"Access-Control-Allow-Methods": "GET, OPTIONS"
      }
   }
   intervalGraphics = 0

   constructor() {
      super()
      this.state = {
         url_funcion_edades: this.url_funcion_edades,
         url_funcion_ultimos: this.url_funcion_ultimos,
         url_grafica_deptos: this.url_grafica_deptos,
         url_grafica_edad: this.url_grafica_edad,
         url_grafica_estados: this.url_grafica_estados,
         url_grafica_infectados: this.url_grafica_infectados,
         url_topDeptos: this.url_grafica_infectados,
         topDeptos:{
          labels:[],
          series:[
            []
          ]
         },
         formaContagio:{
          labels:[],
          series:[
            []
          ]
         },
         todos:[],
         estado:{
          labels:[],
          series:[
            []
          ]
         },
         deptos:{
          labels:[],
          series:[
            []
          ]
         },
         ultimos: [["","","","",""],["","","","",""],["","","","",""],["","","","",""],["","","","",""]],
         edades_lista:[

         ],
         edades_string:"",
         barras_edades:{
            labels:[],
            series:[
               []
            ]
         },
      }
      this.initInterval = this.initInterval.bind(this)
      this.process = this.process.bind(this)
      this.process2 = this.process2.bind(this)
      this.req = this.req.bind(this)
      this.destroyInterval = this.destroyInterval.bind(this)
      this.appView = this.appView.bind(this)
      this.initInterval(this);
   }

   initInterval(e) {
      console.log("Recargando...");
      this.intervalGraphics = setInterval(() => {
         this.req()

      }, 5000)
   }

   req() {
      //console.log("pasaron 5 seg")
      this.state.barras_edades.labels = []
      this.state.barras_edades.labels.push(" 0-10")
      this.state.barras_edades.labels.push("11-20")
      this.state.barras_edades.labels.push("21-30")
      this.state.barras_edades.labels.push("31-40")
      this.state.barras_edades.labels.push("41-50")
      this.state.barras_edades.labels.push("51-60")
      this.state.barras_edades.labels.push("61-70")
      this.state.barras_edades.labels.push("71-80")
      this.state.barras_edades.labels.push("81-90")
      this.state.barras_edades.labels.push("91-100")
      
      fetch(  this.url_funcion_edades).then(res => {
         return res.text()
      }).then((dat) => {
         dat = dat.toString().replace(/,}/g, "}")
         dat = dat.toString().replace(/,]/g, "]")
         var data = dat.split(",")

         
        this.state.barras_edades.series = [0,0,0,0,0,0,0,0,0,0]

        for(let i = 1 ; i < data.length; i++){
          let valor = +data[i]
          if (valor > 0 &&  valor < 11){
            this.state.barras_edades.series[0]++;
          }else if(valor < 21){
            this.state.barras_edades.series[1]++;
          }else if(valor < 31){
            this.state.barras_edades.series[2]++;
          }else if(valor < 41){
            this.state.barras_edades.series[3]++;
          }else if(valor < 51){
            this.state.barras_edades.series[4]++;
          }else if(valor < 61){
            this.state.barras_edades.series[5]++;
          }else if(valor < 71){
            this.state.barras_edades.series[6]++;
          }else if(valor < 81){
            this.state.barras_edades.series[7]++;
          }else if(valor < 91){
            this.state.barras_edades.series[8]++;
          }else if(valor < 101){
            this.state.barras_edades.series[9]++;
          }
        }

        this.state.barras_edades = this.state.barras_edades;   
        this.setState(this.state); 
      })

      fetch(this.url_funcion_ultimos).then(res => {
        return res.text()
      }).then((dat) => {
        dat = dat.toString().replace(/,}/g, "}")
        dat = dat.toString().replace(/,]/g, "]")
        var data = dat.split("\n")

        for(let i = 0 ; i < data.length; i++){
          let valor = data[i].split(":")
          let ultimos_ = [valor[1],valor[3],valor[5],valor[7],valor[9]]
          this.state.ultimos[i] = ultimos_;
        }

       this.state.ultimos= this.state.ultimos;   
       this.setState(this.state); 
      })

      fetch(this.url_topDeptos).then(res => {
        return res.text()
      }).then((dat) => {
        dat = dat.toString().replace(/,}/g, "}")
        dat = dat.toString().replace(/,]/g, "]")
        var data = JSON.parse(dat)
        
        this.state.topDeptos.labels[0]=data[0]._id
        this.state.topDeptos.labels[1]=data[1]._id
        this.state.topDeptos.labels[2]=data[2]._id
        this.state.topDeptos.series[0]=data[0].contador
        this.state.topDeptos.series[1]=data[1].contador
        this.state.topDeptos.series[2]=data[2].contador
        
        this.state.topDeptos = this.state.topDeptos;   
        this.setState(this.state); 
      })
      fetch(this.url_grafica_infectados).then(res => {
        return res.text()
      }).then((dat) => {
        dat = dat.toString().replace(/,}/g, "}")
        dat = dat.toString().replace(/,]/g, "]")
        var data = JSON.parse(dat)
        let totales = 0;
        for(let i=0;i<data.length;i++){
          totales = totales+data[i].contador
          this.state.formaContagio.labels[i] = data[i]._id
        }
        for(let i=0;i<data.length;i++){
          this.state.formaContagio.series[i] = (data[i].contador/totales*100)
          this.state.formaContagio.labels[i] = this.state.formaContagio.labels[i]+"\n"+(this.state.formaContagio.series[i]).toFixed(2)+"%"
        }
        this.state.formaContagio = this.state.formaContagio;   
        this.setState(this.state); 
      })

      fetch(this.url_grafica_estados).then(res => {
        return res.text()
      }).then((dat) => {
        dat = dat.toString().replace(/,}/g, "}")
        dat = dat.toString().replace(/,]/g, "]")
        var data = JSON.parse(dat)
        let totales = 0;
        for(let i=0;i<data.length;i++){
          totales = totales+data[i].contador
          this.state.estado.labels[i] = data[i]._id
        }
        for(let i=0;i<data.length;i++){
          this.state.estado.series[i] = (data[i].contador/totales*100)
          this.state.estado.labels[i] = this.state.estado.labels[i]+"\n"+(this.state.estado.series[i]).toFixed(2)+"%"
        }
        this.state.estado = this.state.estado;   
        this.setState(this.state); 
      })
      fetch(this.url_grafica_deptos).then(res => {
        return res.text()
      }).then((dat) => {
        dat = dat.toString().replace(/,}/g, "}")
        dat = dat.toString().replace(/,]/g, "]")
        var data = JSON.parse(dat)
        let totales = 0;
        for(let i=0;i<data.length;i++){
          totales = totales+data[i].contador
          this.state.deptos.labels[i] = data[i]._id
        }
        for(let i=0;i<data.length;i++){
          this.state.deptos.series[i] = (data[i].contador/totales*100)
          this.state.deptos.labels[i] = this.state.deptos.labels[i]+"\n"+(this.state.deptos.series[i]).toFixed(2)+"%"
        }
        this.state.deptos = this.state.deptos;   
        this.setState(this.state); 
      })

      fetch(this.url_todos).then(res => {
        return res.text()
      }).then((dat) => {
        dat = dat.toString().replace(/,}/g, "}")
        dat = dat.toString().replace(/,]/g, "]")
        var data = JSON.parse(dat)
        let totales = 0;
        for(let i=0;i<data.length;i++){
          this.state.todos[i] = data[i]
        }
        this.state.todos = this.state.todos;   
        this.setState(this.state); 
      })
   }

   destroyInterval(e) {
      clearInterval(this.intervalGraphics)
   }

   process2(children, parent, padding) {

    return children.map((child, i) => {

       return (
          
          <div className="" id={"p_" + parent} key={i} style={{ paddingLeft: padding }}>
             <div className="panel list-group font-weight-light">
                <a href={"#c_" + child._id} data-parent={"#p_" + parent} data-toggle="collapse" className="list-group-item list-group-item-action m-0 p-0">
                   <div className="row m-0 p-0">
                      <p className="col-4 m-0 p-0"><small>{child.name}</small></p>
                      <p className="col-2 m-0 p-0"><small>{child.location}</small></p>
                      <p className="col-2 m-0 p-0"><small>{child.age}</small></p>
                      <p className="col-2 m-0 p-0"><small>{child.infected_type}</small></p>
                      <p className="col-2 m-0 p-0"><small>{child.state}</small></p>
                   </div>
                </a>
             </div>
          </div>
       );

    });
 }

   process(children, parent, padding) {
         return (
            <div className="" id={"p_" + parent} key="aabb" style={{ paddingLeft: padding }}>
               <div className="panel list-group font-weight-light">
               <a href={"#c_a"} data-parent={"#p_" + parent} data-toggle="collapse" className="list-group-item list-group-item-action m-0 p-0">
                  <div className="row m-0 p-0">
                    <p className="col-4 m-0 p-0"><small>{this.state.ultimos[0][0]}</small></p>
                    <p className="col-2 m-0 p-0"><small>{this.state.ultimos[0][1]}</small></p>
                    <p className="col-2 m-0 p-0"><small>{this.state.ultimos[0][2]}</small></p>
                    <p className="col-2 m-0 p-0"><small>{this.state.ultimos[0][3]}</small></p>
                    <p className="col-2 m-0 p-0"><small>{this.state.ultimos[0][4]}</small></p>
                  </div>
                  <div className="row m-0 p-0">
                    <p className="col-4 m-0 p-0"><small>{this.state.ultimos[1][0]}</small></p>
                    <p className="col-2 m-0 p-0"><small>{this.state.ultimos[1][1]}</small></p>
                    <p className="col-2 m-0 p-0"><small>{this.state.ultimos[1][2]}</small></p>
                    <p className="col-2 m-0 p-0"><small>{this.state.ultimos[1][3]}</small></p>
                    <p className="col-2 m-0 p-0"><small>{this.state.ultimos[1][4]}</small></p>
                  </div>
                  <div className="row m-0 p-0">
                    <p className="col-4 m-0 p-0"><small>{this.state.ultimos[2][0]}</small></p>
                    <p className="col-2 m-0 p-0"><small>{this.state.ultimos[2][1]}</small></p>
                    <p className="col-2 m-0 p-0"><small>{this.state.ultimos[2][2]}</small></p>
                    <p className="col-2 m-0 p-0"><small>{this.state.ultimos[2][3]}</small></p>
                    <p className="col-2 m-0 p-0"><small>{this.state.ultimos[2][4]}</small></p>
                  </div>
                  <div className="row m-0 p-0">
                    <p className="col-4 m-0 p-0"><small>{this.state.ultimos[3][0]}</small></p>
                    <p className="col-2 m-0 p-0"><small>{this.state.ultimos[3][1]}</small></p>
                    <p className="col-2 m-0 p-0"><small>{this.state.ultimos[3][2]}</small></p>
                    <p className="col-2 m-0 p-0"><small>{this.state.ultimos[3][3]}</small></p>
                    <p className="col-2 m-0 p-0"><small>{this.state.ultimos[3][4]}</small></p>
                  </div>
                  <div className="row m-0 p-0">
                    <p className="col-4 m-0 p-0"><small>{this.state.ultimos[4][0]}</small></p>
                    <p className="col-2 m-0 p-0"><small>{this.state.ultimos[4][1]}</small></p>
                    <p className="col-2 m-0 p-0"><small>{this.state.ultimos[4][2]}</small></p>
                    <p className="col-2 m-0 p-0"><small>{this.state.ultimos[4][3]}</small></p>
                    <p className="col-2 m-0 p-0"><small>{this.state.ultimos[4][4]}</small></p>
                  </div>
                  </a>
               </div>
            </div>
         );
   }

   render() {
      //this.initInterval()
      //this.req()
      return (
         this.appView()
      );
   }
   appView() {
      return (
         <div className="App">
            <nav className="navbar navbar-dark bg-primary justify-content-center">
               <span className="navbar-brand">Realtime COVID19 | Display 2020</span>
            </nav>

            <div className="container col-sm-10 col-md-8 mt-4">
               <nav>
                  <div className="nav nav-tabs" id="nav-tab" role="tablist">
                     <a className="nav-item nav-link active" id="nav-data-tab" data-toggle="tab" href="#nav-data" role="tab" aria-controls="nav-data" aria-selected="true">Ultimos 5 Casos</a>
                     <a className="nav-item nav-link" id="nav-graphics-tab" data-toggle="tab" href="#nav-graphics" role="tab" aria-controls="nav-graphics" aria-selected="false">Edades Infectados</a>
                     <a className="nav-item nav-link" id="nav-top3-tab" data-toggle="tab" href="#nav-top3" role="tab" aria-controls="nav-top3" aria-selected="false">Top 3 Departamentos</a>
                     <a className="nav-item nav-link" id="nav-porcentajes-tab" data-toggle="tab" href="#nav-porcentajes" role="tab" aria-controls="nav-porcentajes" aria-selected="false">Porcentajes</a>
                     <a className="nav-item nav-link" id="nav-todos-tab" data-toggle="tab" href="#nav-todos" role="tab" aria-controls="nav-todos" aria-selected="false">Todos los casos</a>
                  </div>
               </nav>
               <div className="tab-content" id="nav-tabContent">
                  <div className="tab-pane fade show active" id="nav-data" role="tabpanel" aria-labelledby="nav-data-tab">

                     <div className="card mt-3">
                        <div className="card-header">
                           <h1 className="h4">Ultimos 5 Casos Infectados</h1>
                        </div>
                     </div>

                     <div className="card mt-4 mb-5">
                        <div className="card-header ml-0 pl-0 pr-0">
                           <div className="row m-0 p-0">
                              <div className="col-4 m-0 p-0"><small>Nombre</small></div>
                              <div className="col-2 m-0 p-0">Locacion</div>
                              <div className="col-2 m-0 p-0">Edad</div>
                              <div className="col-2 m-0 p-0">Forma de Contagio</div>
                              <div className="col-2 m-0 p-0">Estado</div>
                           </div>
                        </div>
                        {
                          this.process(this.state.data, "accordion", 0)
                        }
                     </div>
                  </div>
                  <div className="tab-pane fade" id="nav-graphics" role="tabpanel" aria-labelledby="nav-graphics-tab">
                     <div className="card mt-3">
                        <div className="card-header">
                           <h1 className="h4">Rangos de edades</h1>
                        </div>
                     </div>

                     <div className="card mt-3"  style={{marginBottom:100+"px"}} >
                        <div className="card-header">
                           <h1 className="h4">Infectados por edades</h1>
                        </div>
                        <div className="card-body">
                           <ChartistGraph data={this.state.barras_edades} options={
                              {
                                 low: 0,
                                 showArea: true,
                                 distributeSeries: true
                              }
                           } type={'Bar'} />
                           <div className="d-flex justify-content-around mt-4">
                              <label htmlFor="">Edades</label>
                           </div>
                        </div>
                        <div className="card-body" >
                           <ChartistGraph  data={this.state.barras_edades} options={
                              {
                                low: 0,
                                showArea: true,
                                distributeSeries: true,
                                labelDirection: 'explode',
                                width: '600px',
                                height: '400px'
                                //chartPadding: -100,
                                //scaleMinSpace: 100
                              }
                           } type={'Pie'} />
                           <div className="d-flex justify-content-around mt-4">
                              <label htmlFor="">Edades</label>
                           </div>
                        </div>
                     </div>
                  </div>
                  <div className="tab-pane fade" id="nav-top3" role="tabpanel" aria-labelledby="nav-top3-tab">
                     <div className="card mt-3">
                     <div className="card mt-3">
                        <div className="card-header">
                           <h1 className="h4">TOP 3</h1>
                        </div>
                     </div>
                     <div className="card-body" >
                           <ChartistGraph  data={this.state.topDeptos} options={
                              {
                                low: 0,
                                showArea: true,
                                distributeSeries: true,
                                width: '600px',
                                height: '400px'
                              }
                           } type={'Bar'} />
                           <div className="d-flex justify-content-around mt-4">
                              <label htmlFor="">Top 3 Departamentos con mas casos confirmados</label>
                           </div>
                        </div>
                      </div>  
                  </div>
                  <div className="tab-pane fade" id="nav-porcentajes" role="tabpanel" aria-labelledby="nav-porcentajes-tab">
                     <div className="card mt-3">
                     <div className="card mt-3">
                        <div className="card-header">
                           <h1 className="h4">PORCENTAJES</h1>
                        </div>
                     </div>
                     <div className="card-body" >
                           <ChartistGraph  data={this.state.formaContagio} options={
                              {
                                low: 0,
                                showArea: true,
                                distributeSeries: true,
                                width: '600px',
                                height: '400px'
                              }
                           } type={'Pie'} />
                           <div className="d-flex justify-content-around mt-4">
                              <label htmlFor="">Forma Contagio</label>
                           </div>
                      </div>
                      <div className="card-body" >
                           <ChartistGraph  data={this.state.estado} options={
                              {
                                low: 0,
                                showArea: true,
                                distributeSeries: true,
                                width: '600px',
                                height: '400px'
                              }
                           } type={'Pie'} />
                           <div className="d-flex justify-content-around mt-4">
                              <label htmlFor="">Estado</label>
                           </div>
                      </div>
                      <div className="card-body" >
                           <ChartistGraph  data={this.state.deptos} options={
                              {
                                low: 0,
                                showArea: true,
                                distributeSeries: true,
                                width: '600px',
                                height: '400px'
                              }
                           } type={'Pie'} />
                           <div className="d-flex justify-content-around mt-4">
                              <label htmlFor="">Departamentos</label>
                           </div>
                      </div>
                    </div>  
                    
                  </div>
                  <div className="tab-pane fade" id="nav-todos" role="tabpanel" aria-labelledby="nav-todos-tab">

                     <div className="card mt-3">
                        <div className="card-header">
                           <h1 className="h4">Casos reportados de Covid19</h1>
                        </div>
                     </div>

                     <div className="card mt-4 mb-5">
                        <div className="card-header ml-0 pl-0 pr-0">
                           <div className="row m-0 p-0">
                              <div className="col-4 m-0 p-0"><small>Nombre</small></div>
                              <div className="col-2 m-0 p-0">Locacion</div>
                              <div className="col-2 m-0 p-0">Edad</div>
                              <div className="col-2 m-0 p-0">Forma de Contagio</div>
                              <div className="col-2 m-0 p-0">Estado</div>
                           </div>
                        </div>
                        {
                          this.process2(this.state.todos, "accordion", 0)
                        }
                     </div>
                  </div>
               </div>
            </div>
         </div>
      )
   }
}

export default App;