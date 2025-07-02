<template>
    <div class="header-Main">
        <div class="menu-container">
            <button class="menu-btn" @click="gotoApresentation()"><i class="fa-solid fa-person-chalkboard"></i> Apresentação</button>
            <button class="menu-btn" @click="gotoCatalogSheet()"><i class="fa-solid fa-clipboard"></i> Ficha Catalográfica</button>
            <button class="menu-btn" @click="gotoSource()"><i class="fa-solid fa-magnifying-glass"></i> Fontes</button>
        </div>
        <div class="header-title-container">
            <p class="header-Title">{{Title}}</p>
            <p class="header-SubTitle" v-if="subTitle">{{ subTitle }}</p>
        </div>
        <button class="back-button" @click="goBack()">Voltar</button>
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
    /* border-radius: 0px 0px 40px 40px;  */
}
.header-title-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    flex: 1;
}

.header-Title{
    font-size: 8vh;
    color: #fff;
    margin:0rem;
}

.header-SubTitle {
  font-size: 2.5vh;
  color: #fff;
  margin-top: 0.5rem;
  text-align: center;
  margin: 0rem;
}

.back-button{
    background-color: #fff;
    display: flex;
    padding: 1rem;
    justify-content: center;
    align-items: center;
    color: #064B15;
    right: 2rem; /* posiciona no canto direito */
    font-size: 3rem;
    border-radius: 40px;
    position: absolute;
    margin-left: 0; /* remova o margin-left */
    top: 50%;
    transform: translateY(-50%);
}
    
@media screen and (max-width: 600px) {

.header-Main{
    background-color: #064B15;
    width: 100%;
    height: 15vh;
    /* border-radius: 0px 0px 40px 40px;  */
}
.header-Title{
    font-size: 4vh;
    margin:0rem;
}
.back-button{
    display: flex;
    padding: 1rem;
    /* margin-left: 75vw; */
    font-size: 1rem;
    border-radius: 40px;
}

}
</style>