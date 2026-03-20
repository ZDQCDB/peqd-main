import { createRouter, createWebHistory } from 'vue-router'
import Login from '@/views/Login.vue'
import Register from '@/views/Register.vue'
import Dashboard from '@/views/Dashboard.vue'
import UserProfile from '@/views/UserProfile.vue'
import AdminManagement from '@/views/AdminManagement.vue'

// 教学模块
import Teaching from '@/views/Teaching/Teaching.vue'
import TeacherTeaching from '@/views/Teaching/TeacherTeaching.vue'
import StudentTeaching from '@/views/Teaching/StudentTeaching.vue'
import AdminTeaching from '@/views/Teaching/AdminTeaching.vue'
import CourseDetail from '@/views/Teaching/CourseDetail.vue'

// 群体模块
import Group from '@/views/Group/Group.vue'
import PECampus from '@/views/Group/PECampus.vue'
import MorningExercise from '@/views/Group/MorningExercise.vue'
import ExtracurricularActivity from '@/views/Group/ExtracurricularActivity.vue'
import Activity from '@/views/Group/Activity.vue'
import SunshineRun from '@/views/Group/SunshineRun.vue'
import PEManagement from '@/views/Group/PEManagement.vue'
import RaceResults from '@/views/Group/RaceResults.vue'

// 训练模块
import Training from '@/views/Training/Training.vue'
import TeacherTraining from '@/views/Training/TeacherTraining.vue'
import StudentTraining from '@/views/Training/StudentTraining.vue'
import PEScore from '@/views/Training/PEScore.vue'

// 其他模块
import PhysicalTest from '@/views/PhysicalTest.vue'
import Equipment from '@/views/Equipment/Equipment.vue'
import TeacherEquipment from '@/views/Equipment/TeacherEquipment.vue'
import StudentEquipment from '@/views/Equipment/StudentEquipment.vue'
import Venue from '@/views/Venue/Venue.vue'
import VenueManagement from '@/views/Venue/VenueManagement.vue'
import VenueReservation from '@/views/Venue/VenueReservation.vue'
import Listening from '@/views/Listening.vue'
import SportsEquipment from '@/views/SportsEquipment/SportsEquipment.vue'
import EquipmentSharing from '@/views/SportsEquipment/EquipmentSharing.vue'
import Statistics from '@/views/Statistics.vue'

const routes = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    name: 'Login',
    component: Login
  },
  {
    path: '/register',
    name: 'Register',
    component: Register
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: Dashboard,
    meta: { requiresAuth: true }
  },
  {
    path: '/profile',
    name: 'UserProfile',
    component: UserProfile,
    meta: { requiresAuth: true }
  },
  {
    path: '/admin',
    name: 'AdminManagement',
    component: AdminManagement,
    meta: { 
      requiresAuth: true,
      roles: ['super_admin', 'school_admin']
    }
  },
  {
    path: '/teaching',
    name: 'Teaching',
    component: Teaching,
    meta: { requiresAuth: true }
  },
  {
    path: '/teaching/teacher',
    name: 'TeacherTeaching',
    component: TeacherTeaching,
    meta: { requiresAuth: true }
  },
  {
    path: '/teaching/student',
    name: 'StudentTeaching',
    component: StudentTeaching,
    meta: { requiresAuth: true }
  },
  {
    path: '/teaching/admin',
    name: 'AdminTeaching',
    component: AdminTeaching,
    meta: { 
      requiresAuth: true,
      roles: ['super_admin', 'school_admin', 'department_admin']
    }
  },
  {
    path: '/teaching/course/:id',
    name: 'CourseDetail',
    component: CourseDetail,
    meta: { 
      requiresAuth: true,
      roles: ['super_admin', 'school_admin', 'department_admin']
    }
  },
  {
    path: '/group',
    name: 'Group',
    component: Group,
    meta: { requiresAuth: true }
  },
  {
    path: '/group/pe-campus',
    name: 'PECampus',
    component: PECampus,
    meta: { requiresAuth: true }
  },
  {
    path: '/group/morning-exercise',
    name: 'MorningExercise',
    component: MorningExercise,
    meta: { requiresAuth: true }
  },
  {
    path: '/group/extracurricular',
    name: 'ExtracurricularActivity',
    component: ExtracurricularActivity,
    meta: { requiresAuth: true }
  },
  {
    path: '/group/activity',
    name: 'Activity',
    component: Activity,
    meta: { requiresAuth: true }
  },
  {
    path: '/group/sunshine-run',
    name: 'SunshineRun',
    component: SunshineRun,
    meta: { requiresAuth: true }
  },
  {
    path: '/group/management',
    name: 'PEManagement',
    component: PEManagement,
    meta: { requiresAuth: true }
  },
  {
    path: '/group/race-results',
    name: 'RaceResults',
    component: RaceResults,
    meta: { requiresAuth: true }
  },
  {
    path: '/training',
    name: 'Training',
    component: Training,
    meta: { requiresAuth: true }
  },
  {
    path: '/training/teacher',
    name: 'TeacherTraining',
    component: TeacherTraining,
    meta: { requiresAuth: true }
  },
  {
    path: '/training/student',
    name: 'StudentTraining',
    component: StudentTraining,
    meta: { requiresAuth: true }
  },
  {
    path: '/training/score',
    name: 'PEScore',
    component: PEScore,
    meta: { requiresAuth: true }
  },
  {
    path: '/physical-test',
    name: 'PhysicalTest',
    component: PhysicalTest,
    meta: { requiresAuth: true }
  },
  {
    path: '/equipment',
    name: 'Equipment',
    component: Equipment,
    meta: { requiresAuth: true }
  },
  {
    path: '/equipment/teacher',
    name: 'TeacherEquipment',
    component: TeacherEquipment,
    meta: { requiresAuth: true }
  },
  {
    path: '/equipment/student',
    name: 'StudentEquipment',
    component: StudentEquipment,
    meta: { requiresAuth: true }
  },
  {
    path: '/venue',
    name: 'Venue',
    component: Venue,
    meta: { requiresAuth: true }
  },
  {
    path: '/venue/management',
    name: 'VenueManagement',
    component: VenueManagement,
    meta: { requiresAuth: true }
  },
  {
    path: '/venue/reservation',
    name: 'VenueReservation',
    component: VenueReservation,
    meta: { requiresAuth: true }
  },
  {
    path: '/listening',
    name: 'Listening',
    component: Listening,
    meta: { requiresAuth: true }
  },
  {
    path: '/sports-equipment',
    name: 'SportsEquipment',
    component: SportsEquipment,
    meta: { requiresAuth: true }
  },
  {
    path: '/sports-equipment/sharing',
    name: 'EquipmentSharing',
    component: EquipmentSharing,
    meta: { requiresAuth: true }
  },
  {
    path: '/statistics',
    name: 'Statistics',
    component: Statistics,
    meta: { 
      requiresAuth: true,
      roles: ['school_admin', 'department_admin']
    }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 引入认证服务
import authService from '@/services/authService'

// 路由守卫
router.beforeEach(async (to, from, next) => {
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
  
  if (requiresAuth) {
    const isAuthenticated = authService.checkCurrentSession()
    
    if (!isAuthenticated) {
      next('/login')
      return
    }
    
    // 检查角色权限（如果路由有角色要求）
    if (to.meta.roles) {
      const user = await authService.getCurrentUser()
      if (!user || !to.meta.roles.includes(user.userType)) {
        alert('权限不足')
        next('/dashboard')
        return
      }
    }
  }
  
  next()
})

export default router 