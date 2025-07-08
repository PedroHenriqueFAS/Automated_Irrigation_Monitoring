<template>
    <div class="header-Main">
        <!-- <div class="menu-container">
            <button class="menu-btn" @click="gotoApresentation()"><i class="fa-solid fa-person-chalkboard"></i> Apresentação</button>
            <button class="menu-btn" @click="gotoCatalogSheet()"><i class="fa-solid fa-clipboard"></i> Ficha Catalográfica</button>
            <button class="menu-btn" @click="gotoSource()"><i class="fa-solid fa-magnifying-glass"></i> Fontes</button>
        </div> -->
        <button class="back-button" @click="goBack()">Voltar</button>
        <div class="header-title-container">
            <p class="header-Title">{{Title}}</p>
            <p class="header-SubTitle" v-if="subTitle">{{ subTitle }}</p>
        </div>
    </div>
</template>

<script>
import { SubTitle } from 'chart.js'

export default {
    name:"Header",
    data(){
        return{
        }
    },
    methods: {
        goBack(){
            this.$router.go(-1)
        },
        gotoApresentation(){
            this.$router.push('/apresentation')
        },
        gotoCatalogSheet(){
            this.$router.push('/catalog')
        },
        gotoSource(){
            this.$router.push('/sources')
        }
    },
    props:['Title', 'subTitle']
    
}
</script>

<style scoped>
.menu-container{
    /* display: flex;
    flex-direction: row;
    margin-left: 0px; */
    position: absolute;
    left: 2rem;
    top: 50%;
    transform: translateY(-50%);
}
.menu-btn{
    background-color: transparent;
    border: none;
    color: #fff;
}
.header-Main{
    background-color: #064B15;
    width: 100%;
    height: 20vh;
    margin-top: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 0;
    position: relative; /* Adicione esta linha */
    padding: 1rem 2rem; 
    box-sizing: border-box; /* Garante que o padding não aumente o tamanho total */
}
.header-title-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    /* flex: 1; */
}

.header-Title{
    font-size: clamp(2rem, 5vw, 3rem);
    color: #fff;
    margin:0rem;
}

.header-SubTitle {
  font-size: clamp(1rem, 3vw, 1.25rem);
  color: #fff;
  margin-top: 0.5rem;
  text-align: center;
  margin: 0rem;
}

.back-button{
     /* 1. REATIVAMOS O POSITION: ABSOLUTE */
 position: absolute; 
 /* 2. POSICIONAMOS NA ESQUERDA */
 left: 2rem; 
 top: 50%;
 transform: translateY(-50%); /* Truque para centralizar verticalmente */

 background-color: #fff;
 display: flex;
 padding: 0.5rem 1.5rem;
 justify-content: center;
 align-items: center;
 color: #064B15;
 font-size: clamp(0.9rem, 2.5vw, 1rem);
 border-radius: 40px;
 border: none;
 cursor: pointer;
 white-space: nowrap;
}
    
@media screen and (max-width: 600px) {

.header-Main{
    background-color: #064B15;
    width: 100%;
    height: auto;
    margin-bottom: 20%;
}
.header-Title{
    font-size: clamp(1.5rem, 5vw, 2.2rem);
}
.back-button{
    padding: 0.5rem 0.5rem;
    font-size: 0.9rem;
}

}
</style>