<template>
    <div class="main">
      <Header :Title="title"/> 
        <div class="content">
          <div class="stats-container">
                <div class="ground-temp-stat">                    
                    <p class="ground-temp-stat-label"><font-awesome-icon icon="fa-solid fa-temperature-high" />&nbsp;Temperatura</p>
                    <p class="ground-temp-stat-value">{{Ground_Temperature}} °C</p>
                </div>

                <div class="ground-humidity-stat">
                    <p class="ground-humidity-stat-label"><font-awesome-icon icon="fa-solid fa-droplet" />&nbsp;Umidade</p>
                    <p class="ground-humidity-stat-value">{{Ground_Humidity}} %</p>
                </div>

                <div class="air-temp-stat">
                    <p class="air-temp-stat-label"><font-awesome-icon icon="fa-solid fa-temperature-high" />&nbsp;Temp Ambiente</p>
                    <p class="air-temp-stat-value">{{ Air_Temperature }} °C</p>
                </div>

                <div class="air-humidity-stat">
                    <p class="air-humidity-stat-label"><font-awesome-icon icon="fa-solid fa-droplet" />&nbsp;Umidade Ambiente</p>
                    <p class="air-humidity-stat-value">{{ Air_Humidity }} %</p>

                </div>
          </div>
          <div class="graph-stats">
              <Line :data="data" :options="options"  />
          </div>
          
        </div>
   </div>
</template>
<script>
import Header from "../components/Header.vue"
import { auth } from '../firebase/index.js'
import { ref, onValue} from "firebase/database";
import {db} from "@/firebase/index.js"

import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
} from 'chart.js'

import { Bar } from 'vue-chartjs'
import { Line } from 'vue-chartjs'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend,
  PointElement,
  LineElement,)

export default {
   components:{
       Header,
       Bar,
       Line
   },
   
   data(){
        return{
            title:"Pimentão",
            Stats_Vector:[15,16,17,18,19,19,16],
            computed: {
            myStyles () {
                return {
                    height: "50vh",
                    width:"70vw"
                }
            },
            
            },

            data: {
            labels: ['Domingo','Segunda', 'Terça-Feira', 'Quarta-Feira','Quinta-Feira','Sexta-Feira','Sabado'],
            datasets: [
                { data: [25, 27, 24, 28, 27, 22, 25],
                label:'Temperatura do Solo',
                backgroundColor: 'rgba(255, 0, 0, 100)',
                borderColor: 'rgba(255, 0, 0, 100)',
                },
                { data: [77, 65, 73, 71, 69, 67,70],
                    label:'Umidade do Solo',
                    backgroundColor: 'rgba(0, 255, 0, 100)',
                    borderColor: 'rgba(0, 255, 0, 100)', 
                },
                { data: [25, 26, 28, 27, 24,26,25],
                label:'Temperatura Ambiente',
                backgroundColor: 'rgba(0, 0, 255, 100)',
                borderColor: 'rgba(0, 0, 255, 100)'
                },
                { data: [68, 70, 49, 59, 60, 55, 50],
                    label:'Umidade Ambiente',
                    backgroundColor: 'rgba(0, 255, 255, 100)',
                    borderColor: 'rgba(0, 255, 255, 100)', 
                },
                ],
                
            },

            options: {
                responsive: true,
            },

            Ground_Temperature:"19.32",
            Ground_Humidity:"45",
            Air_Temperature:"20.31",
            Air_Humidity:"60",
            Stats_Vector:[15,16,17,18,19,19,16],
        }
    },
    mounted(){
    this.getValues()
    if(auth.currentUser){
      console.log("logado")
    }
    
  },

  methods: {
  getValues() {
    const dados = ref(db, 'UsersData/readings');
    onValue(dados, (snapshot) => {
      const readings = snapshot.val();
      const lastReading = Object.values(readings).pop(); // Obtém a última leitura

      if (lastReading) {
        this.Ground_Temperature = lastReading.soilTemp || 'N/A';
        this.Ground_Humidity = Math.round((lastReading.moistureHum / 1024) * 100) || 'N/A';
        this.Air_Temperature = lastReading.airTemp || 'N/A';
        this.Air_Humidity = lastReading.airHum || 'N/A';
      }
    });
  },
},

//   methods:{
//      getValues(){
//       const dados= ref(db)
//         onValue(dados,(snapshot)=>{
//       let dados =JSON.parse(JSON.stringify(snapshot.val().UsersData.readings));
//       const vector= (Object.entries(dados)).slice(-7);
//       const last_reading = (Object.entries(dados)).slice(-1);
//         this.leituras = vector;
//         this.Ground_Temperature=last_reading[0][1].soilTemp;
//         this.Ground_Humidity=Math.round(((last_reading[0][1].moistureHum)/1024)*100);
//         this.Air_Temperature=last_reading[0][1].airTemp;
//         this.Air_Humidity=last_reading[0][1].airHum;
//       console.log(this.leituras)
//       console.log(last_reading[0][1].soilTemp)
      
     

      
//     })
      
//     }

//   },
  created(){

    
    

    // const dados= ref(db)

    // onValue(dados,(snapshot)=>{
    // const data = snapshot.val().stats;
    //     this.Ground_Temperature=snapshot.val().stats.ground_temperature;
    //     this.Ground_Humidity=snapshot.val().stats.ground_humidity;
    //     this.Air_Temperature=snapshot.val().stats.air_temperature;
    //     this.Air_Humidity=snapshot.val().stats.air_humidity;
    //     console.log(data)
    // })
},
    
  
  
}
</script>
<style scoped>

.content{
    justify-content: center;
    align-items: center;
    flex-direction: column;
}

.stats-container{
    display: flex;
    justify-content: center;
    align-items: center;
}
.ground-temp-stat,.air-temp-stat,.air-humidity-stat,.ground-humidity-stat{
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: flex-end;
    margin: 1rem;
    background-color: #064B15;
    border-radius: 40px;
    width: 20vw;
    height: 18vh;
    color: #fff;
}
.ground-temp-stat-label,.air-temp-stat-label,.air-humidity-stat-label,.ground-humidity-stat-label{
    font-size: 2.5vw;
    padding: 0;
    margin: 0rem 1rem 0rem 1rem;
}

.air-temp-stat-label,.air-humidity-stat-label{
    font-size: 2vw;
    margin: 0rem 1rem 0rem 1rem;
}
.ground-temp-stat-value,.air-temp-stat-value,.air-humidity-stat-value,.ground-humidity-stat-value{
    font-size: 2rem;
    margin: 1rem 1rem 1rem 1rem;
    
}

.graph-stats{
    display: flex;
    justify-content: center;
    height: 30vw;
    width: 70vw;
}

@media screen and (max-width: 600px) {
.ground-temp-stat,.air-temp-stat,.air-humidity-stat,.ground-humidity-stat{
    margin:1rem 0.8rem 1rem 0.2rem;
    width: 20vw;
    height: 10vh;
    border-radius: 20px;
}
.ground-temp-stat-label,.air-temp-stat-label,.air-humidity-stat-label,.ground-humidity-stat-label{
    font-size: 2.5vw;
    padding: 0rem;
    margin: 1rem 1rem 0rem 0rem;
}

.air-temp-stat-label,.air-humidity-stat-label{
    font-size: 2.8vw;
    padding: 0rem;
    margin: 10rem 0rem 0rem 1rem;
}
.ground-temp-stat-value,.air-temp-stat-value,.air-humidity-stat-value,.ground-humidity-stat-value{
    font-size: 1.25rem;
    margin: 1px 1rem 1px 1px;
}

.graph-stats{
    display: flex;
    justify-content: center;
    height: 50vw;
    width: 100vw;
}

}

</style>