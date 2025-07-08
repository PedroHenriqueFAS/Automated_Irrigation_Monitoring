// Importações
const { SerialPort } = require('serialport');
const { DelimiterParser } = require('@serialport/parser-delimiter');
const { db } = require('./src/firebase/index.js');
const { ref, set } = require('firebase/database');

// --- Configurações ---
const porta = new SerialPort({
  path: 'COM4', 
  baudRate: 9600,
});

// ADICIONADO: Lista de nós que esperamos receber em cada rodada
const EXPECTED_NODES = ['2', '3', '4'];

// ADICIONADO: Objeto para guardar os dados da rodada atual (nosso "buffer")
let dataBatch = {};

// ADICIONADO: Flag para controlar o período de espera
let isOnCooldown = false;

// ADICIONADO: Intervalo de espera em milissegundos (1 minuto)
const COOLDOWN_PERIOD = 60 * 1000;

const myserialparser = porta.pipe(new DelimiterParser({ delimiter: '\n' }));

// --- Funções Auxiliares ---

// ADICIONADO: Função para enviar a rodada completa para o Firebase
function sendBatchToFirebase() {
  console.log('--- Rodada completa! Enviando dados para o Firebase... ---');
  
  // Cria uma lista de promessas de envio
  const sendPromises = Object.entries(dataBatch).map(([nodeId, data]) => {
    const dbPath = `UsersData/Node${nodeId}/readings/${data.timestamp}`;
    const dbRef = ref(db, dbPath);
    return set(dbRef, data).then(() => {
      console.log(`✅ Dado do Nó ${nodeId} enviado.`);
    });
  });

  // Executa todas as promessas de envio
  Promise.all(sendPromises)
    .then(() => {
      console.log('--- ✅ Rodada completa enviada com sucesso! ---');
    })
    .catch((error) => {
      console.error('--- ❌ Erro ao enviar a rodada completa: ---', error);
    })
    .finally(() => {
      // Limpa o buffer para a próxima rodada
      dataBatch = {};
      // Inicia o período de espera
      isOnCooldown = true;
      console.log(`--- Período de espera de 1 minuto iniciado. ---`);
      setTimeout(() => {
        isOnCooldown = false;
        console.log(`--- Período de espera finalizado. Pronto para coletar nova rodada. ---`);
      }, COOLDOWN_PERIOD);
    });
}


// --- Eventos da Porta Serial ---

porta.on('open', function() {
  console.log('Conexão Serial Aberta. Coletando a primeira rodada de dados...');
});

myserialparser.on('data', function(data) {
  // Se estiver no período de espera, ignora qualquer dado que chegar
  if (isOnCooldown) {
    return;
  }

  const receivedString = data.toString().trim();
  if (!receivedString) return;

  const regex = /^N(\d)T([\d.-]+)U([\d.-]+)$/;
  const match = receivedString.match(regex);

  if (match) {
    const nodeId = match[1];
    let tempValue = parseFloat(match[2]);
    const umidValue = parseFloat(match[3]);
    let processedData = {};

    // Processa os dados de acordo com o nó
    switch (nodeId) {
      case '4':
        processedData = {
          timestamp: Date.now(),
          temperaturaAmbiente: tempValue / 10,
          umidadeAmbiente: umidValue / 10
        };
        break;
      case '3':
        processedData = {
          timestamp: Date.now(),
          temperaturaSolo: tempValue,
          umidadeSolo: umidValue / 1000
        };
        break;
      case '2':
        processedData = {
          timestamp: Date.now(),
          temperaturaSolo: tempValue,
          umidadeSolo: umidValue / 1000
        };
        break;
      default:
        console.warn(`!! Nó com ID desconhecido recebido e ignorado: ${nodeId}`);
        return;
    }

    // Armazena o dado processado no buffer da rodada
    // Se um dado do mesmo nó chegar de novo, ele só atualiza com o valor mais recente
    dataBatch[nodeId] = processedData;
    console.log(`-- Dado do Nó ${nodeId} recebido e guardado. Rodada atual: ${Object.keys(dataBatch).length}/${EXPECTED_NODES.length}`);

    // Verifica se a rodada está completa
    const receivedNodes = Object.keys(dataBatch);
    const isComplete = EXPECTED_NODES.every(node => receivedNodes.includes(node));

    if (isComplete) {
      sendBatchToFirebase();
    }
  } else {
    console.warn(`!! Formato de dado inválido recebido e ignorado: "${receivedString}"`);
  }
});

porta.on('error', function(err) {
  console.error('❌ Erro Crítico na Porta Serial:', err.message);
});



// // Importações
// const { SerialPort } = require('serialport');
// const { DelimiterParser } = require('@serialport/parser-delimiter');

// // Importa o Firebase Database
// const { db } = require('./src/firebase/index.js');
// const { ref, set } = require('firebase/database');

// // --- Configuração da Porta Serial ---
// const porta = new SerialPort({
//   path: 'COM4', // Ajustado para a porta correta
//   baudRate: 9600,
// });

// const myserialparser = porta.pipe(new DelimiterParser({ delimiter: '\n' }));

// // --- Eventos da Porta Serial ---

// porta.on('open', function() {
//   console.log('Conexão Serial Aberta. Aguardando dados dos nós...');
// });

// myserialparser.on('data', function(data) {
//   const receivedString = data.toString().trim();
//   if (!receivedString) return;

//   const regex = /^N(\d)T([\d.-]+)U([\d.-]+)$/;
//   const match = receivedString.match(regex);

//   if (match) {
//     const nodeId = match[1];
//     let tempValue = parseFloat(match[2]); // Usa 'let' para permitir modificação
//     const umidValue = parseFloat(match[3]);

//     let dbPath = '';
//     let data_to_send = {};

//     switch (nodeId) {
//       case '4': // Sensor de Ambiente
//         // APLICA A CONVERSÃO: Divide o valor da temperatura por 10
//         const tempAmbConvertida = tempValue / 10; // Ex: 238 se torna 23.8
//         const umidAmbConvertida = umidValue / 10; // Ex: 456 se torna 45.6

//         console.log(`Recebido do Nó de Ambiente (N4): Temp=${tempAmbConvertida.toFixed(2)}, Umid=${umidAmbConvertida.toFixed(2)}`);
//         dbPath = `UsersData/Node4/readings/${Date.now()}`;
//         data_to_send = {
//           timestamp: Date.now(),
//           temperaturaAmbiente: tempAmbConvertida,
//           umidadeAmbiente: umidAmbConvertida
//         };
//         break;

//       case '3': // Sensor de Solo 1

//         const umidSolo3Convertida = umidValue / 1000;

//         console.log(`Recebido do Nó de Solo (N3): Temp=${tempValue.toFixed(2)}, Umid=${umidSolo3Convertida.toFixed(2)}`);
//         dbPath = `UsersData/Node3/readings/${Date.now()}`;
//         data_to_send = {
//           timestamp: Date.now(),
//           temperaturaSolo: tempValue,
//           umidadeSolo: umidSolo3Convertida
//         };
//         break;
      
//       case '2': // Sensor de Solo 2

//         const umidSolo2Convertida = umidValue / 1000;

//         console.log(`Recebido do Nó de Solo (N2): Temp=${tempValue.toFixed(2)}, Umid=${umidSolo2Convertida.toFixed(2)}`);
//         dbPath = `UsersData/Node2/readings/${Date.now()}`;
//         data_to_send = {
//           timestamp: Date.now(),
//           temperaturaSolo: tempValue,
//           umidadeSolo: umidSolo2Convertida
//         };
//         break;

//       default:
//         console.warn(`!! Nó com ID desconhecido recebido e ignorado: ${nodeId}`);
//         return;
//     }

//     const dbRef = ref(db, dbPath);
//     set(dbRef, data_to_send)
//       .then(() => console.log(`✅ Dados do Nó ${nodeId} armazenados com sucesso!`))
//       .catch((error) => console.error(`❌ Erro ao armazenar dados do Nó ${nodeId}:`, error));

//   } else {
//     console.warn(`!! Formato de dado inválido recebido e ignorado: "${receivedString}"`);
//   }
// });

// porta.on('error', function(err) {
//   console.error('❌ Erro Crítico na Porta Serial:', err.message);
// });


