<template>
    <div class="main">
        <Header :Title="title"/> 
        <div class="content">
            <div class="menu">
                <!-- <NavBar/> -->
            </div>
           <div class="plant-button-container">
               <button class="plant-button" @click="goToStats('stats')">Rua 1</button>
               <button class="plant-config-button" @click="goToConfig()"><font-awesome-icon icon="fa-solid fa-gear" /></button>
           </div>

           <div class="plant-button-container">
               <button class="plant-button" @click="goToStats('stats02')">Rua 2</button>
               <button class="plant-config-button" @click="goToConfig()"><font-awesome-icon icon="fa-solid fa-gear" /></button>
           </div>

           <div class="plant-button-container">
               <button class="plant-button" @click="goToStats('stats03')">Rua 3</button>
               <button class="plant-config-button" @click="goToConfig()"><font-awesome-icon icon="fa-solid fa-gear" /></button>
           </div>

       </div>
    </div>
</template>

<script>
import NavBar from "@/components/NavBar.vue"
import Header from "../components/Header.vue"
import { auth } from '../firebase/index.js'
export default {
    components:{
    Header,
    NavBar
},
    methods: {
        goToStats(statsPage){
            this.$router.push("/" + statsPage)
        },
        goToConfig(){
            this.$router.push("/config")
        },
    },
    data(){
        return{
            title:"Bem Vindo(a)"
        }
    },
    mounted(){
    if(auth.currentUser){
      console.log("logado")
    }
  }
}
</script>

<style scoped>
/* --- ESTILOS GERAIS (DESKTOP) --- */
.fa-gear {
  width: auto;
  height: auto;
}

.content {
  display: flex;
  /* ALTERADO: Voltamos para 'center' para alinhar o bloco todo com o título */
  justify-content: center; 
  align-items: center;
  padding: 0 2rem;
}

.plant-button-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: fit-content;
  /* ALTERADO: Adicionamos margem lateral para criar espaço entre os botões */
  margin: 0 4vw; 
}

.plant-button {
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #064B15;
  color: #fff;
  width: 15vw;
  height: 10vh;
  font-size: 2.5vw;
  border-radius: 40px;
  margin: 3rem 0;
  border: none;
  cursor: pointer;
}

.plant-config-button {
  display: flex;
  justify-content: center;
  align-items: center;
  color: #fff;
  background-color: #064B15;
  border-radius: 100%;
  margin-left: 1rem;
  width: 3vw;
  height: 3vw;
  border: none;
  cursor: pointer;
}

/* ======================================================= */
/* --- AJUSTES PARA TELAS MENORES (CELULARES) --- */
/* ======================================================= */
@media screen and (max-width: 600px) {
  .content {
    flex-direction: column;
    align-items: center;
    padding: 2rem 1rem;
    gap: 2rem;
    margin: 0; /* Reseta a margem para o mobile */
  }

  .plant-button-container {
    width: 100%;
    max-width: 400px;
    justify-content: space-between;
    margin: 0; /* Reseta a margem para o mobile */
  }

  .plant-button {
    margin: 0; 
    width: 80%;
    height: 9vh;
    font-size: 5vw;
  }

  .plant-config-button {
    margin: 0;
    width: 15%;
    height: 0;
    padding-bottom: 15%;
    position: relative;
  }
  
  .plant-config-button .fa-gear {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-size: 5vw;
  }
}
</style>