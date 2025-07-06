// // Importações
// const { SerialPort } = require('serialport');
// const { DelimiterParser } = require('@serialport/parser-delimiter');

// // Importa o Firebase Database
// const { db } = require('./src/firebase/index.js'); // Caminho
// const { ref, set } = require('firebase/database'); // Importa as funções necessárias do Firebase Database

// // Configuração da porta serial
// const porta = new SerialPort({
//   path: 'COM3',
//   baudRate: 9600,
// });

// // Configuração do parser para separar os dados por linha
// const myserialparser = porta.pipe(new DelimiterParser({ delimiter: '\n' }));

// // Variáveis para armazenar medições
// let areaData = [];

// // Evento quando a porta serial é aberta
// myserialparser.on('open', function() {
//   console.log('Conexão Serial Aberta');
// });

// // Evento ao receber dados da porta serial
// myserialparser.on('data', function(data) {
//   const dataReady = data.toString().trim();
//   areaData.push(dataReady);

//   if (areaData.length >= 8) {
//     try {
//       const umidade1 = areaData[3]?.split('=')[1]?.trim() || 'N/A';
//       const umidade2 = areaData[7]?.split('=')[1]?.trim() || 'N/A';

//       if (!umidade1 || !umidade2) {
//         throw new Error('Dados de umidade inválidos ou incompletos');
//       }

//       // Armazena as medições nas variáveis apropriadas
//       const solo1 = areaData[1];
//       const mbomba1 = areaData[2];
//       const solo2 = areaData[5];
//       const mbomba2 = areaData[6];

//       // Exibe as medições armazenadas
//       console.log(`Medições: 
//         Solo 1: ${solo1}, 
//         M.Bomba 1: ${mbomba1}, 
//         Umidade 1: ${umidade1}, 
//         Solo 2: ${solo2}, 
//         M.Bomba 2: ${mbomba2}, 
//         Umidade 2: ${umidade2}`);

//       const measurementData = {
//         timestamp: Date.now(),
//         soilTemp: areaData[1],
//         moistureHum: umidade1,
//         airTemp: areaData[5],
//         airHum: umidade2,
//       };

//       const dbRef = ref(db, 'UsersData/readings/' + Date.now());
//       set(dbRef, measurementData)
//         .then(() => console.log('Medições armazenadas com sucesso no Firebase!'))
//         .catch((error) => console.error('Erro ao armazenar medições no Firebase:', error));
//     } catch (error) {
//       console.error('Erro ao processar os dados recebidos:', error.message);
//     }

//     areaData = [];
//   }
// });

// porta.on('error', function(err) {
//   console.log('Erro na Porta Serial:', err.message);
// });


// Importações
const { SerialPort } = require('serialport');
const { DelimiterParser } = require('@serialport/parser-delimiter');

// Importa o Firebase Database
const { db } = require('./src/firebase/index.js');
const { ref, set } = require('firebase/database');

// --- Configuração da Porta Serial ---
const porta = new SerialPort({
  path: 'COM4', // Ajustado para a porta correta
  baudRate: 9600,
});

const myserialparser = porta.pipe(new DelimiterParser({ delimiter: '\n' }));

// --- Eventos da Porta Serial ---

porta.on('open', function() {
  console.log('Conexão Serial Aberta. Aguardando dados dos nós...');
});

myserialparser.on('data', function(data) {
  const receivedString = data.toString().trim();
  if (!receivedString) return;

  const regex = /^N(\d)T([\d.-]+)U([\d.-]+)$/;
  const match = receivedString.match(regex);

  if (match) {
    const nodeId = match[1];
    let tempValue = parseFloat(match[2]); // Usa 'let' para permitir modificação
    const umidValue = parseFloat(match[3]);

    let dbPath = '';
    let data_to_send = {};

    switch (nodeId) {
      case '4': // Sensor de Ambiente
        // APLICA A CONVERSÃO: Divide o valor da temperatura por 10
        const tempAmbConvertida = tempValue / 10; // Ex: 238 se torna 23.8
        const umidAmbConvertida = umidValue / 10; // Ex: 456 se torna 45.6

        console.log(`Recebido do Nó de Ambiente (N4): Temp=${tempAmbConvertida.toFixed(2)}, Umid=${umidAmbConvertida.toFixed(2)}`);
        dbPath = `UsersData/Node4/readings/${Date.now()}`;
        data_to_send = {
          timestamp: Date.now(),
          temperaturaAmbiente: tempAmbConvertida,
          umidadeAmbiente: umidAmbConvertida
        };
        break;

      case '3': // Sensor de Solo 1

        const umidSolo3Convertida = umidValue / 1000;

        console.log(`Recebido do Nó de Solo (N3): Temp=${tempValue.toFixed(2)}, Umid=${umidSolo3Convertida.toFixed(2)}`);
        dbPath = `UsersData/Node3/readings/${Date.now()}`;
        data_to_send = {
          timestamp: Date.now(),
          temperaturaSolo: tempValue,
          umidadeSolo: umidSolo3Convertida
        };
        break;
      
      case '2': // Sensor de Solo 2

        const umidSolo2Convertida = umidValue / 1000;

        console.log(`Recebido do Nó de Solo (N2): Temp=${tempValue.toFixed(2)}, Umid=${umidSolo2Convertida.toFixed(2)}`);
        dbPath = `UsersData/Node2/readings/${Date.now()}`;
        data_to_send = {
          timestamp: Date.now(),
          temperaturaSolo: tempValue,
          umidadeSolo: umidSolo2Convertida
        };
        break;

      default:
        console.warn(`!! Nó com ID desconhecido recebido e ignorado: ${nodeId}`);
        return;
    }

    const dbRef = ref(db, dbPath);
    set(dbRef, data_to_send)
      .then(() => console.log(`✅ Dados do Nó ${nodeId} armazenados com sucesso!`))
      .catch((error) => console.error(`❌ Erro ao armazenar dados do Nó ${nodeId}:`, error));

  } else {
    console.warn(`!! Formato de dado inválido recebido e ignorado: "${receivedString}"`);
  }
});

porta.on('error', function(err) {
  console.error('❌ Erro Crítico na Porta Serial:', err.message);
});