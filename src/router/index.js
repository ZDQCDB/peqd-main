import { createRouter, createWebHistory } from 'vue-router'
import Login from '@/views/Login.vue'
import Register from '@/views/Register.vue'
import SidebarLayout from '@/layouts/SidebarLayout.vue'
import Dashboard from '@/views/Dashboard.vue'
import UserProfile from '@/views/UserProfile.vue'
import AdminManagement from '@/views/AdminManagement.vue'
import SchoolAccountManagement from '@/views/SchoolAccountManagement.vue'

import TeacherTeaching from '@/views/Teaching/TeacherTeaching.vue'
import StudentTeaching from '@/views/Teaching/StudentTeaching.vue'
import AdminTeaching from '@/views/Teaching/AdminTeaching.vue'
import CourseDetail from '@/views/Teaching/CourseDetail.vue'
import ScheduleImport from '@/views/Teaching/ScheduleImport.vue'
import ClassSelectionWindow from '@/views/Teaching/ClassSelectionWindow.vue'
import TempClassManagement from '@/views/Teaching/TempClassManagement.vue'

import MorningExercise from '@/views/Group/MorningExercise.vue'
import SunshineRun from '@/views/Group/SunshineRun.vue'
import HomeworkDashboard from '@/views/Group/HomeworkDashboard.vue'
import HomeworkAssignment from '@/views/Group/HomeworkAssignment.vue'
import HomeworkCompletionDashboard from '@/views/Group/HomeworkCompletionDashboard.vue'
import PEManagement from '@/views/Group/PEManagement.vue'
import Activity from '@/views/Group/Activity.vue'
import RaceResults from '@/views/Group/RaceResults.vue'
import SportsManagement from '@/views/Group/SportsManagement.vue'
import SportsMeetingDetail from '@/views/Group/SportsMeetingDetail.vue'

import TeacherTraining from '@/views/Training/TeacherTraining.vue'
import StudentTraining from '@/views/Training/StudentTraining.vue'
import PEScore from '@/views/Training/PEScore.vue'

import PhysicalTest from '@/views/PhysicalTest.vue'
import TeacherEquipment from '@/views/Equipment/TeacherEquipment.vue'
import VenueManagement from '@/views/Venue/VenueManagement.vue'
import Listening from '@/views/Listening.vue'
import SportsEquipment from '@/views/SportsEquipment/SportsEquipment.vue'
import EquipmentSharing from '@/views/SportsEquipment/EquipmentSharing.vue'
import Statistics from '@/views/Statistics.vue'

const CompanyLanding = () => import('@/views/CompanyLanding.vue')

const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', name: 'Login', component: Login },
  { path: '/register', name: 'Register', component: Register },
  { path: '/company', name: 'CompanyLanding', component: CompanyLanding },

  // Admin management (standalone, no sidebar)
  {
    path: '/admin',
    name: 'AdminManagement',
    component: AdminManagement,
    meta: { requiresAuth: true, roles: ['super_admin', 'school_admin', 'department_admin'] }
  },
  {
    path: '/admin/school-accounts',
    name: 'SchoolAccountManagement',
    component: SchoolAccountManagement,
    meta: { requiresAuth: true, roles: ['super_admin', 'school_admin'] }
  },
  {
    path: '/admin/counselor-management',
    name: 'CounselorManagement',
    component: () => import('@/views/Admin/CounselorManagement.vue'),
    meta: { requiresAuth: true, roles: ['department_admin', 'school_admin', 'super_admin'] }
  },

  // All other pages use SidebarLayout
  {
    path: '/',
    component: SidebarLayout,
    meta: { requiresAuth: true },
    children: [
      { path: 'dashboard', name: 'Dashboard', component: Dashboard },
      { path: 'profile', name: 'UserProfile', component: UserProfile },

      // Teaching
      {
        path: 'teaching/teacher', name: 'TeacherTeaching', component: TeacherTeaching,
        meta: { roles: ['teacher', 'counselor', 'department_admin', 'school_admin', 'super_admin'] }
      },
      { path: 'teaching/student', name: 'StudentTeaching', component: StudentTeaching },
      {
        path: 'teaching/admin', name: 'AdminTeaching', component: AdminTeaching,
        meta: { roles: ['super_admin', 'school_admin', 'department_admin', 'counselor'] }
      },
      {
        path: 'teaching/course/:id', name: 'CourseDetail', component: CourseDetail,
        meta: { roles: ['super_admin', 'school_admin', 'department_admin', 'counselor'] }
      },
      {
        path: 'teaching/schedule-import', name: 'ScheduleImport', component: ScheduleImport,
        meta: { roles: ['school_admin', 'super_admin'] }
      },
      {
        path: 'teaching/class-selection-window', name: 'ClassSelectionWindow', component: ClassSelectionWindow,
        meta: { roles: ['school_admin', 'super_admin'] }
      },
      {
        path: 'teaching/temp-class-management', name: 'TempClassManagement', component: TempClassManagement,
        meta: { roles: ['school_admin', 'super_admin', 'teacher'] }
      },

      // Group
      {
        path: 'group/morning-exercise', name: 'MorningExercise', component: MorningExercise,
        meta: { roles: ['counselor', 'department_admin', 'school_admin', 'super_admin'] }
      },
      { path: 'group/sunshine-run', name: 'SunshineRun', component: SunshineRun },
      {
        path: 'group/homework', name: 'HomeworkDashboard', component: HomeworkDashboard,
        meta: { roles: ['counselor', 'department_admin', 'school_admin', 'super_admin'] }
      },
      {
        path: 'group/homework-assignment', name: 'HomeworkAssignment', component: HomeworkAssignment,
        meta: { roles: ['teacher'] }
      },
      {
        path: 'group/homework-completion-dashboard', name: 'HomeworkCompletionDashboard', component: HomeworkCompletionDashboard,
        meta: { roles: ['department_admin', 'school_admin', 'super_admin'] }
      },
      {
        path: 'group/management', name: 'PEManagement', component: PEManagement,
        meta: { roles: ['counselor', 'department_admin', 'school_admin', 'super_admin'] }
      },
      { path: 'group/activity', name: 'Activity', component: Activity },
      { path: 'group/race-results', name: 'RaceResults', component: RaceResults },
      {
        path: 'group/sports-management', name: 'SportsManagement', component: SportsManagement,
        meta: { roles: ['school_admin', 'super_admin'] }
      },
      {
        path: 'group/sports-management/:id', name: 'SportsMeetingDetail', component: SportsMeetingDetail,
        meta: { roles: ['school_admin', 'super_admin'] }
      },

      // Training
      {
        path: 'training/teacher', name: 'TeacherTraining', component: TeacherTraining,
        meta: { roles: ['teacher', 'counselor', 'department_admin', 'school_admin', 'super_admin'] }
      },
      { path: 'training/student', name: 'StudentTraining', component: StudentTraining },
      {
        path: 'training/score', name: 'PEScore', component: PEScore,
        meta: { roles: ['counselor', 'department_admin', 'school_admin', 'super_admin'] }
      },

      // Others
      { path: 'physical-test', name: 'PhysicalTest', component: PhysicalTest },
      { path: 'equipment', redirect: '/equipment/teacher' },
      {
        path: 'equipment/teacher', name: 'TeacherEquipment', component: TeacherEquipment,
        meta: { roles: ['counselor', 'department_admin', 'school_admin', 'super_admin'] }
      },
      { path: 'venue', redirect: '/venue/management' },
      {
        path: 'venue/management', name: 'VenueManagement', component: VenueManagement,
        meta: { roles: ['counselor', 'department_admin', 'school_admin', 'super_admin'] }
      },
      {
        path: 'listening', name: 'Listening', component: Listening,
        meta: { roles: ['teacher', 'counselor', 'department_admin', 'school_admin', 'super_admin'] }
      },
      { path: 'sports-equipment', name: 'SportsEquipment', component: SportsEquipment },
      { path: 'sports-equipment/sharing', name: 'EquipmentSharing', component: EquipmentSharing },
      {
        path: 'statistics', name: 'Statistics', component: Statistics,
        meta: { roles: ['school_admin', 'department_admin', 'counselor'] }
      },
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

import authService from '@/services/authService'

router.beforeEach(async (to, from, next) => {
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)

  if (requiresAuth) {
    const isAuthenticated = authService.checkCurrentSession()
    if (!isAuthenticated) { next('/login'); return }

    const routeMeta = to.meta
    if (routeMeta.roles) {
      const user = await authService.getCurrentUser()
      if (!user || !routeMeta.roles.includes(user.userType)) {
        alert('权限不足')
        next('/dashboard')
        return
      }
    }
  }

  next()
})

export default router
