// Importações
const { SerialPort } = require('serialport');
const { DelimiterParser } = require('@serialport/parser-delimiter');

// Importa o Firebase Database
const { db } = require('./src/firebase/index.js'); // Caminho
const { ref, set } = require('firebase/database'); // Importa as funções necessárias do Firebase Database

// Configuração da porta serial
const porta = new SerialPort({
  path: 'COM3',
  baudRate: 9600,
});

// Configuração do parser para separar os dados por linha
const myserialparser = porta.pipe(new DelimiterParser({ delimiter: '\n' }));

// Variáveis para armazenar medições
let areaData = [];

// Evento quando a porta serial é aberta
myserialparser.on('open', function() {
  console.log('Conexão Serial Aberta');
});

// Evento ao receber dados da porta serial
myserialparser.on('data', function(data) {
  const dataReady = data.toString().trim();
  areaData.push(dataReady);

  if (areaData.length >= 8) {
    try {
      const umidade1 = areaData[3]?.split('=')[1]?.trim() || 'N/A';
      const umidade2 = areaData[7]?.split('=')[1]?.trim() || 'N/A';

      if (!umidade1 || !umidade2) {
        throw new Error('Dados de umidade inválidos ou incompletos');
      }

      // Armazena as medições nas variáveis apropriadas
      const solo1 = areaData[1];
      const mbomba1 = areaData[2];
      const solo2 = areaData[5];
      const mbomba2 = areaData[6];

      // Exibe as medições armazenadas
      console.log(`Medições: 
        Solo 1: ${solo1}, 
        M.Bomba 1: ${mbomba1}, 
        Umidade 1: ${umidade1}, 
        Solo 2: ${solo2}, 
        M.Bomba 2: ${mbomba2}, 
        Umidade 2: ${umidade2}`);

      const measurementData = {
        timestamp: Date.now(),
        soilTemp: areaData[1],
        moistureHum: umidade1,
        airTemp: areaData[5],
        airHum: umidade2,
      };

      const dbRef = ref(db, 'UsersData/readings/' + Date.now());
      set(dbRef, measurementData)
        .then(() => console.log('Medições armazenadas com sucesso no Firebase!'))
        .catch((error) => console.error('Erro ao armazenar medições no Firebase:', error));
    } catch (error) {
      console.error('Erro ao processar os dados recebidos:', error.message);
    }

    areaData = [];
  }
});

porta.on('error', function(err) {
  console.log('Erro na Porta Serial:', err.message);
});