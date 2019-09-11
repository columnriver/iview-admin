<template>
  <Form ref="loginForm" :model="form" :rules="rules" @keydown.enter.native="handleSubmit">
    <FormItem prop="userName">
      <Input v-model="form.userName" placeholder="请输入用户名">
        <span slot="prepend">
          <Icon :size="16" type="ios-person"></Icon>
        </span>
      </input>
    </FormItem>
    <FormItem prop="password">
      <Input type="password" v-model="form.password" placeholder="请输入密码">
        <span slot="prepend">
          <Icon :size="14" type="md-lock"></Icon>
        </span>
      </Input>
    </FormItem>
    <Checkbox v-model="single">记住密码</Checkbox><br><br>
    <FormItem>
      <Button @click="handleSubmit" type="primary" long>登录</Button>
    </FormItem>
  </Form>
</template>
<script>
import CryptoJS from 'crypto-js' // 加密js
export default {
  name: 'LoginForm',
  props: {
    userNameRules: {
      type: Array,
      default: () => {
        return [
          { required: true, message: '账号不能为空', trigger: 'blur' }
        ]
      }
    },
    passwordRules: {
      type: Array,
      default: () => {
        return [
          { required: true, message: '密码不能为空', trigger: 'blur' }
        ]
      }
    }
  },
  data () {
    return {
      single: false,
      form: {
        userName: '',
        password: ''
      }
    }
  },
  computed: {
    rules () {
      return {
        userName: this.userNameRules,
        password: this.passwordRules
      }
    }
  },
  created () {
    this.getCookie()
  },
  methods: {
    handleSubmit () {
      this.$refs.loginForm.validate((valid) => {
        const self = this
        if (valid) {
          this.$emit('on-success-valid', {
            userName: this.form.userName,
            password: this.form.password
          })
          console.log(self.single)
          if (self.single === true) {
            console.log('true')
            self.setCookie(self.form.userName, self.form.password, 7)
          } else {
            console.log('false')
            // 清空Cookie
            self.clearCookie()
          }
          self.locking(self.form.userName, self.form.password)
        }
      })
    },
    // 设置cookie方法
    setCookie (c_name, c_pwd, exdays) {
      c_pwd = CryptoJS.AES.encrypt(c_pwd, 'secret key 123') // 使用CryptoJS方法加密
      var exdate = new Date() // 获取时间
      exdate.setTime(exdate.getTime() + 24 * 60 * 60 * 1000 * exdays) // 保存的天数
      // 字符串拼接cookie
      window.document.cookie =
        'userName' + '=' + c_name + ';path=/;expires=' + exdate.toGMTString()
      window.document.cookie =
        'password' + '=' + c_pwd + ';path=/;expires=' + exdate.toGMTString()
    },
    // 设置cookie方法
    locking (c_name, c_pwd, exdays) {
      c_pwd = CryptoJS.AES.encrypt(c_pwd, 'secret key 123') // 使用CryptoJS方法加密
      var exdate = new Date() // 获取时间
      exdate.setTime(exdate.getTime() + 24 * 60 * 60 * 1000 * exdays) // 保存的天数
      // 字符串拼接cookie
      window.document.cookie =
        'user' + '=' + c_name + ';path=/;expires=' + exdate.toGMTString()
      window.document.cookie =
        'lockingpad' + '=' + c_pwd + ';path=/;expires=' + exdate.toGMTString()
    },
    // 读取cookie
    getCookie () {
      if (document.cookie.length > 0) {
        var arr = document.cookie.split('; ') // 这里显示的格式需要切割一下自己可输出看下
        for (var i = 0; i < arr.length; i++) {
          var arr2 = arr[i].split('=') // 再次切割
          // console.log(arr2)
          if (arr2[0] === 'userName') {
            // console.log('user')
            this.single = true
            this.form.userName = arr2[1] // 拿到账号
          } else if (arr2[0] === 'password') {
            // 拿到拿到加密后的密码arr2[1]并解密
            var bytes = CryptoJS.AES.decrypt(
              arr2[1].toString(),
              'secret key 123'
            )
            var plaintext = bytes.toString(CryptoJS.enc.Utf8) // 拿到解密后的密码（登录时输入的密码）
            this.form.password = plaintext
          }
        }
      }
    },
    // 清除cookie
    clearCookie: function () {
      this.setCookie('', '', -1) // 修改2值都为空，天数为负1天就好了
    }
  }
}
</script>
