import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import Login from '../views/Login.vue'
import Stats from '../views/Stats.vue'
import Stats02 from '../views/Stats02.vue'
import Stats03 from '../views/Stats03.vue'
import Config from '../views/Config.vue'
import CatalogSheet from '../views/CatalogSheet.vue'
import Sources from '../views/Sources.vue'
import Apresentation from '../views/Apresentation.vue'

const routes = [
  {
    path: '/',
    name: 'Login',
    component: Login
  },
  {
    path: '/home',
    name: 'home',
    component: Home
  },
  {
    path: '/config',
    name: 'config',
    component: Config
  },
  {
    path: '/stats',
    name: 'stats',
    component: Stats
  },
  {
    path: '/stats02',
    name: 'stats02',
    component: Stats02
  },
  {
    path: '/stats03',
    name: 'stats03',
    component: Stats03
  },
  {
    path: '/catalog',
    name: 'catalogSheet',
    component: CatalogSheet
  },
  {
    path: '/sources',
    name: 'sources',
    component: Sources
  },
  {
    path: '/apresentation',
    name: 'apresentation',
    component: Apresentation
  },
  
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router
