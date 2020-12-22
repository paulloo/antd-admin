/* global window */

import { history } from 'umi'
import { stringify } from 'qs'
import store from 'store'
import { ROLE_TYPE } from 'utils/constant'
import { queryLayout } from 'utils'
import { CANCEL_REQUEST_MESSAGE } from 'utils/constant'
import api from 'api'
import config from 'config'
const { pathToRegexp } = require("path-to-regexp")
const { queryRouteList, logoutUser, queryUserInfo } = api

const goDashboard = () => {
  if (pathToRegexp(['/', '/login']).exec(window.location.pathname)) {
    history.push({
      pathname: '/dashboard',
    })
  }
}

export default {
  namespace: 'app',
  state: {
    routeList: [
      {
        id: '1',
        icon: 'laptop',
        name: 'Dashboard',
        zhName: '仪表盘',
        router: '/dashboard',
      },
    ],
    locationPathname: '',
    locationQuery: {},
    theme: store.get('theme') || 'light',
    collapsed: store.get('collapsed') || false,
    notifications: [
      {
        title: 'New User is registered.',
        date: new Date(Date.now() - 10000000),
      },
      {
        title: 'Application has been approved.',
        date: new Date(Date.now() - 50000000),
      },
    ],
  },
  subscriptions: {
    setup({ dispatch }) {
      dispatch({ type: 'query' })
    },
    setupHistory({ dispatch, history }) {
      history.listen(location => {
        dispatch({
          type: 'updateState',
          payload: {
            locationPathname: location.pathname,
            locationQuery: location.query,
          },
        })
      })
    },

    setupRequestCancel({ history }) {
      history.listen(() => {
        const { cancelRequest = new Map() } = window

        cancelRequest.forEach((value, key) => {
          if (value.pathname !== window.location.pathname) {
            value.cancel(CANCEL_REQUEST_MESSAGE)
            cancelRequest.delete(key)
          }
        })
      })
    },
  },
  effects: {
    *query({ payload }, { call, put, select }) {
      // store isInit to prevent query trigger by refresh
      const isInit = store.get('isInit')
      if (isInit) {
        goDashboard()
        return
      }
      const { locationPathname } = yield select(_ => _.app)
      debugger
      try {
        const { success, data } = yield call(queryUserInfo, payload)
        if (success && data) {
          // const { list } = yield call(queryRouteList)
          
          const list = [
            {
              id: '1',
              icon: 'dashboard',
              name: 'Dashboard',
              zh: {
                name: '仪表盘'
              },
              'pt-br': {
                name: 'Dashboard'
              },
              route: '/dashboard',
            },
            {
              id: '2',
              breadcrumbParentId: '1',
              name: 'Users',
              zh: {
                name: '用户管理'
              },
              'pt-br': {
                name: 'Usuário'
              },
              icon: 'user',
              route: '/user',
            },
            {
              id: '7',
              breadcrumbParentId: '1',
              name: 'Posts',
              zh: {
                name: '用户管理'
              },
              'pt-br': {
                name: 'Posts'
              },
              icon: 'shopping-cart',
              route: '/post',
            },
            {
              id: '21',
              menuParentId: '-1',
              breadcrumbParentId: '2',
              name: 'User Detail',
              zh: {
                name: '用户详情'
              },
              'pt-br': {
                name: 'Detalhes do usuário'
              },
              route: '/user/:id',
            },
            {
              id: '3',
              breadcrumbParentId: '1',
              name: 'Request',
              zh: {
                name: 'Request'
              },
              'pt-br': {
                name: 'Requisição'
              },
              icon: 'api',
              route: '/request',
            },
            {
              id: '4',
              breadcrumbParentId: '1',
              name: 'UI Element',
              zh: {
                name: 'UI组件'
              },
              'pt-br': {
                name: 'Elementos UI'
              },
              icon: 'camera-o',
            },
            {
              id: '45',
              breadcrumbParentId: '4',
              menuParentId: '4',
              name: 'Editor',
              zh: {
                name: 'Editor'
              },
              'pt-br': {
                name: 'Editor'
              },
              icon: 'edit',
              route: '/editor',
            },
            {
              id: '5',
              breadcrumbParentId: '1',
              name: 'Charts',
              zh: {
                name: 'Charts'
              },
              'pt-br': {
                name: 'Graficos'
              },
              icon: 'code-o',
            },
            {
              id: '51',
              breadcrumbParentId: '5',
              menuParentId: '5',
              name: 'ECharts',
              zh: {
                name: 'ECharts'
              },
              'pt-br': {
                name: 'ECharts'
              },
              icon: 'line-chart',
              route: '/chart/ECharts',
            },
            {
              id: '52',
              breadcrumbParentId: '5',
              menuParentId: '5',
              name: 'HighCharts',
              zh: {
                name: 'HighCharts'
              },
              'pt-br': {
                name: 'HighCharts'
              },
              icon: 'bar-chart',
              route: '/chart/highCharts',
            },
            {
              id: '53',
              breadcrumbParentId: '5',
              menuParentId: '5',
              name: 'Rechartst',
              zh: {
                name: 'Rechartst'
              },
              'pt-br': {
                name: 'Rechartst'
              },
              icon: 'area-chart',
              route: '/chart/Recharts',
            },
          ]
          const { role } = data
          const permissions = {
            role,
            visit: []
          }
          let routeList = list
          if (
            permissions.role === ROLE_TYPE.ADMIN ||
            permissions.role === ROLE_TYPE.USER
          ) {
            permissions.visit = list.map(item => item.id)
          } else {
            routeList = list.filter(item => {
              const cases = [
                permissions.visit.includes(item.id),
                item.mpid
                  ? permissions.visit.includes(item.mpid) || item.mpid === '-1'
                  : true,
                item.bpid ? permissions.visit.includes(item.bpid) : true,
              ]
              return cases.every(_ => _)
            })
          }
          store.set('routeList', routeList)
          store.set('permissions', permissions)
          store.set('user', data)
          store.set('isInit', true)
          goDashboard()
        } else if (queryLayout(config.layouts, locationPathname) !== 'public') {
          history.push({
            pathname: '/login',
            search: stringify({
              from: locationPathname,
            }),
          })
        }

      } catch (err) {
        debugger
      }
    },

    *signOut({ payload }, { call, put }) {
      const data = yield call(logoutUser)
      if (data.success) {
        store.set('routeList', [])
        store.set('permissions', { visit: [] })
        store.set('user', {})
        store.set('isInit', false)
        yield put({ type: 'query' })
      } else {
        throw data
      }
    },
  },
  reducers: {
    updateState(state, { payload }) {
      return {
        ...state,
        ...payload,
      }
    },

    handleThemeChange(state, { payload }) {
      store.set('theme', payload)
      state.theme = payload
    },

    handleCollapseChange(state, { payload }) {
      store.set('collapsed', payload)
      state.collapsed = payload
    },

    allNotificationsRead(state) {
      state.notifications = []
    },
  },
}
