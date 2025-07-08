<template>
    <div class="main">  
      <Header :Title="title" :subTitle="subtitle"/> 
        <div class="content">
          <div class="stats-container">
                <div class="air-temp-stat">
                    <p class="air-temp-stat-label"><font-awesome-icon icon="fa-solid fa-temperature-high" />&nbsp;Temperatura Ambiente</p>
                    <p class="air-temp-stat-value">{{ Air_Temperature }} °C</p>
                </div>

                <div class="air-humidity-stat">
                    <p class="air-humidity-stat-label"><font-awesome-icon icon="fa-solid fa-droplet" />&nbsp;Umidade Ambiente</p>
                    <p class="air-humidity-stat-value">{{ Air_Humidity }} %</p>
                </div>
          </div>
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
                    <p class="air-temp-stat-label"><font-awesome-icon icon="fa-solid fa-temperature-high" />&nbsp;Fluxo</p>
                    <p class="air-temp-stat-value">{{ flow }} m³/s</p>
                </div>

                <div class="air-humidity-stat">
                    <p class="air-humidity-stat-label"><font-awesome-icon icon="fa-solid fa-droplet" />&nbsp;Vávula Solenoide</p>
                    <p class="air-humidity-stat-value">{{ solenoid_valve }}</p>
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
      subtitle: "Rua 2",
      Ground_Temperature: "--",
      Ground_Humidity: "--",
      Air_Temperature: "--",
      Air_Humidity: "--",
      flow: "--",
      solenoid_valve: "--",
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
    this.listenToSoilNode('Node2');
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
/* Define o layout principal da página */
.content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3rem; /* Espaçamento entre a área dos cards e o gráfico */
  padding: 2rem 1rem; /* Adiciona um respiro nas laterais */
}

.stats-container {
  display: grid;
  /* Cria colunas responsivas: no mínimo 180px, no máximo 1fr (ocupa o espaço disponível) */
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 1.5rem; /* Espaçamento perfeito entre os cards */
  width: 100%;
  max-width: 1200px; /* Limita a largura máxima para não esticar demais em telas grandes */
}

/* 2. O CARD AGORA É FLEXÍVEL */
.ground-temp-stat, .air-temp-stat, .air-humidity-stat, .ground-humidity-stat {
  display: flex;
  flex-direction: column;
  justify-content: center; /* Centraliza o conteúdo verticalmente */
  align-items: center;     /* Centraliza o conteúdo horizontalmente */
  gap: 0.5rem; /* Um pequeno espaço entre o rótulo e o valor */
  
  background-color: #064B15;
  color: #fff;
  border-radius: 20px; /* Um raio mais sutil */
  
  /* REMOVEMOS 'width' e 'height' fixos. O Grid cuida da largura e o conteúdo da altura. */
  padding: 1.5rem 1rem; /* Padding interno para o conteúdo respirar */
  text-align: center;
}

/* 3. TIPOGRAFIA RESPONSIVA COM CLAMP() */
.ground-temp-stat-label, .air-temp-stat-label, .air-humidity-stat-label, .ground-humidity-stat-label {
  /* clamp(MÍNIMO, PREFERIDO, MÁXIMO) - a fonte se adapta à tela, mas nunca fica pequena ou grande demais. */
  font-size: clamp(1.5rem, 2.5vw, 1rem); 
  font-weight: 3000; /* Mais leve */
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.ground-temp-stat-value, .air-temp-stat-value, .air-humidity-stat-value, .ground-humidity-stat-value {
  font-size: clamp(1.5rem, 2vw, 2.2rem);
  font-weight: bold;
  margin: 0;
}

/* 4. O GRÁFICO TAMBÉM PODE SER MAIS SIMPLES */
.graph-stats {
  width: 100%;
  max-width: 1200px;
  /* A altura pode ser definida pela proporção com aspect-ratio */
  aspect-ratio: 16 / 7; 
  height: auto; /* Deixa o aspect-ratio controlar a altura */
}

/* 5. A MEDIA QUERY FICA MUITO MAIS SIMPLES */
@media screen and (max-width: 600px) {
  .content {
    padding: 1rem;
    gap: 2rem;
  }
  
  .stats-container {
    gap: 1rem;
  }
  
  .graph-stats {
    aspect-ratio: 4 / 3; /* Gráfico mais "quadrado" no celular */
  }
}
</style>