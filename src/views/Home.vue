<template>
    <div class="main">
        <Header :Title="title"/> 
        <div class="content">
            <div class="menu">
                <!-- <NavBar/> -->
            </div>
           <div class="plant-button-container">
               <button class="plant-button" @click="goToStats()">Pimentão</button>
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
        goToStats(){
            this.$router.push("/stats")
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

.fa-gear{
    width: auto;
    height: auto;
}
.plant-button-container{
    display: flex;
    justify-content: center;
    align-items: center;
    height: fit-content;
}
.plant-button{
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: #064B15;
    width: 15vw;
    height: 10vh;
    font-size: 3vw;
    border-radius: 40px;
    margin: 8vh 1rem 8vh 10vh;
    color: #fff;
}
.plant-config-button{
    display: flex;
    justify-content: center;
    align-items: center;
    color: #fff;
    background-color: #064B15;
    border-radius: 100%;
    margin-left: 0px;
    width: 3vw;
    height: 3vw;

}

.content{
    display: flex;
    justify-content: flex-start;
}

@media screen and (max-width: 600px) {
.plant-button{ 
    width: 25vw;
    height: 10vh;
    font-size: 4vw;
    margin: 4vh 1rem 4vh 8vh;
}
.plant-config-button{
    border-radius: 100%;
    margin-left: 0px;
    width: 8vw;
    height: 8vw
}


}
    
</style>