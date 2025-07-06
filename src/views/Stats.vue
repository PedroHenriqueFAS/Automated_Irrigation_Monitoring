<template>
    <div class="main">  
      <Header :Title="title" :subTitle="subtitle"/> 
        <div class="content">
          <div class="stats-container">
                <div class="ground-temp-stat">                    
                    <p class="ground-temp-stat-label"><font-awesome-icon icon="fa-solid fa-temperature-high" />&nbsp;Temperatura Solo</p>
                    <p class="ground-temp-stat-value">{{Ground_Temperature}} °C</p>
                </div>

                <div class="ground-humidity-stat">
                    <p class="ground-humidity-stat-label"><font-awesome-icon icon="fa-solid fa-droplet" />&nbsp;Umidade Solo</p>
                    <p class="ground-humidity-stat-value">{{Ground_Humidity}} %</p>
                </div>

                <div class="air-temp-stat">
                    <p class="air-temp-stat-label"><font-awesome-icon icon="fa-solid fa-temperature-high" />&nbsp;Temperatura Ambiente</p>
                    <p class="air-temp-stat-value">{{ Air_Temperature }} °C</p>
                </div>

                <div class="air-humidity-stat">
                    <p class="air-humidity-stat-label"><font-awesome-icon icon="fa-solid fa-droplet" />&nbsp;Umidade Ambiente</p>
                    <p class="air-humidity-stat-value">{{ Air_Humidity }} %</p>
                </div>
          </div>
          <div class="graph-stats">
              <Line :data="chartData" :options="chartOptions"  />
          </div>
          
        </div>
   </div>
</template>

<script>
import Header from "@/components/Header.vue";
import { auth } from '../firebase/index.js';
import { ref, onValue, query, orderByChild, limitToLast } from "firebase/database";
import { db } from "@/firebase/index.js";

import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement,
  CategoryScale,
  LinearScale,
} from 'chart.js';
import { Line } from 'vue-chartjs';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export default {
  components: {
    Header,
    Line,
  },

  data() {
    return {
      title: "Pimentão",
      subtitle: "Rua 1",
      Ground_Temperature: "--",
      Ground_Humidity: "--",
      Air_Temperature: "--",
      Air_Humidity: "--",
      soilReadings: null,
      ambientReadings: null,
      chartData: {
        labels: [],
        datasets: [
          { label: 'Temperatura do Solo (°C)', data: [], borderColor: 'rgba(255, 99, 132, 1)', backgroundColor: 'rgba(255, 99, 132, 0.2)' },
          { label: 'Umidade do Solo', data: [], borderColor: 'rgba(54, 162, 235, 1)', backgroundColor: 'rgba(54, 162, 235, 0.2)' },
          { label: 'Temperatura Ambiente (°C)', data: [], borderColor: 'rgba(255, 206, 86, 1)', backgroundColor: 'rgba(255, 206, 86, 0.2)' },
          { label: 'Umidade Ambiente (%)', data: [], borderColor: 'rgba(75, 192, 192, 1)', backgroundColor: 'rgba(75, 192, 192, 0.2)' }
        ],
      },
      chartOptions: {
        responsive: true,
        maintainAspectRatio: false,
      },
    };
  },

  mounted() {
    console.log("Componente montado. Iniciando ouvintes do Firebase...");
    this.listenToAmbientNode();
    this.listenToSoilNode('Node3');
  },

  methods: {
    listenToAmbientNode() {
      const dbRef = ref(db, 'UsersData/Node4/readings');
      const recentReadingsQuery = query(dbRef, orderByChild('timestamp'), limitToLast(20));
      onValue(recentReadingsQuery, (snapshot) => {
        console.log("Recebido callback do NÓ DE AMBIENTE (Node 4).");
        const readings = snapshot.val();
        if (readings) {
          this.ambientReadings = Object.values(readings);
          this.updateChart();
        } else {
          console.warn("Nenhum dado encontrado para o Nó de Ambiente.");
        }
      });
    },

    listenToSoilNode(nodeId) {
      const dbRef = ref(db, `UsersData/${nodeId}/readings`);
      const recentReadingsQuery = query(dbRef, orderByChild('timestamp'), limitToLast(20));
      onValue(recentReadingsQuery, (snapshot) => {
        console.log(`Recebido callback do NÓ DE SOLO (${nodeId}).`);
        const readings = snapshot.val();
        if (readings) {
          this.soilReadings = Object.values(readings);
          this.updateChart();
        } else {
           console.warn(`Nenhum dado encontrado para o Nó de Solo (${nodeId}).`);
        }
      });
    },

    updateChart() {
      console.log("--- Executando updateChart ---");

      if (!this.soilReadings || !this.ambientReadings) {
        console.log("Ainda aguardando dados de um dos nós. Status -> Solo:", this.soilReadings ? 'OK' : 'Faltando', "| Ambiente:", this.ambientReadings ? 'OK' : 'Faltando');
        return; 
      }

      console.log(`Dados recebidos! Comprimento original -> Solo: ${this.soilReadings.length}, Ambiente: ${this.ambientReadings.length}`);

      const minLength = Math.min(this.soilReadings.length, this.ambientReadings.length);
      console.log(`Tamanho sincronizado definido para: ${minLength}`);

      if (minLength === 0) {
        console.warn("Tamanho sincronizado é 0. Abortando atualização do gráfico.");
        return;
      }
      
      const syncedSoilReadings = this.soilReadings.slice(-minLength);
      const syncedAmbientReadings = this.ambientReadings.slice(-minLength);

      const lastSoilReading = syncedSoilReadings[syncedSoilReadings.length - 1];
      const lastAmbientReading = syncedAmbientReadings[syncedAmbientReadings.length - 1];
      
      // Checagem de segurança para evitar erros
      if (!lastSoilReading || typeof lastSoilReading.temperaturaSolo === 'undefined' || !lastAmbientReading || typeof lastAmbientReading.temperaturaAmbiente === 'undefined') {
        console.error("ERRO: O último registro de dados está incompleto ou corrompido. Abortando.");
        return;
      }

      this.Ground_Temperature = lastSoilReading.temperaturaSolo.toFixed(2);
      this.Ground_Humidity = lastSoilReading.umidadeSolo.toFixed(2);
      this.Air_Temperature = lastAmbientReading.temperaturaAmbiente.toFixed(2);
      this.Air_Humidity = lastAmbientReading.umidadeAmbiente.toFixed(2);
      
      console.log("Cartões atualizados. Montando dados do gráfico...");

      const newChartData = {
        labels: syncedSoilReadings.map(r => new Date(r.timestamp).toLocaleTimeString('pt-BR')),
        datasets: [
          { ...this.chartData.datasets[0], data: syncedSoilReadings.map(r => r.temperaturaSolo) },
          { ...this.chartData.datasets[1], data: syncedSoilReadings.map(r => r.umidadeSolo) },
          { ...this.chartData.datasets[2], data: syncedAmbientReadings.map(r => r.temperaturaAmbiente) },
          { ...this.chartData.datasets[3], data: syncedAmbientReadings.map(r => r.umidadeAmbiente) }
        ]
      };
      
      this.chartData = newChartData;
      console.log(">>> SUCESSO: Objeto chartData foi atualizado e enviado para o Vue. O gráfico deve aparecer agora. <<<");
    }
  },
};
</script>

<style scoped>

.content{
    padding-top: 5vh;
    justify-content: center;
    align-items: center;
    flex-direction: column;
}

.stats-container{
    display: flex;
    justify-content: center;
    align-items: center;
    flex-wrap: wrap; /* Adicione esta linha */
}
.ground-temp-stat,.air-temp-stat,.air-humidity-stat,.ground-humidity-stat{
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: stretch; /* Permite alinhar label à esquerda e valor à direita */
    margin: 1rem;
    background-color: #064B15;
    border-radius: 40px;
    width: 20vw;
    height: 18vh;
    color: #fff;
    padding: 0.5rem 1rem;
    margin-bottom: 2rem
}
.ground-temp-stat-label,.air-temp-stat-label,.air-humidity-stat-label,.ground-humidity-stat-label{
    font-size: 2vw;
    margin: 0rem 1rem 0rem 1rem ;
   
}

.air-temp-stat-label,.air-humidity-stat-label{
    font-size: 2vw;
    margin: 0rem 1rem 0rem 1rem;
}
.ground-temp-stat-value,.air-temp-stat-value,.air-humidity-stat-value,.ground-humidity-stat-value{
    font-size: 2rem;
    margin: 0rem ;
    text-align: right;
    max-width: 95%; /* Garante que o valor ocupe toda a largura do card */
}

.graph-stats{
    display: flex;
    justify-content: center;
    height: 30vw;
    width: 70vw;
    margin-bottom: 3rem
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
    width: 100%;
    margin-bottom: 1.5rem; /* <-- espaçamento após o gráfico */
}

}

</style>