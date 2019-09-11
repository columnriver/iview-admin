import { getParams } from '@/libs/util'
const USER_MAP = {
  super_admin: {
    name: 'super_admin',
    user_id: '1',
    access: ['super_admin', 'admin'],
    token: 'super_admin',
    avator: 'https://www.vue-js.com/public/images/vue.png'
  },
  admin: {
    name: 'admin',
    mobilePhone: '18319935010',
    email: '18319935010@qq.com',
    user_id: '2',
    access: ['admin'],
    token: 'admin',
    avator: 'https://www.z4a.net/images/2019/09/03/8e07feebdb9337be25d493624a3039be_1.jpg'
  }
}

export const login = req => {
  req = JSON.parse(req.body)
  return { token: USER_MAP[req.userName].token }
}

export const getUserInfo = req => {
  const params = getParams(req.url)
  return USER_MAP[params.token]
}

export const logout = req => {
  return null
}
