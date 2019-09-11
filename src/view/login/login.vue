<style lang="less">
  @import './login.less';
  a{
    position: absolute;
    left: 0;
    right: 0;
    bottom: 20px;
    font-size: 14px;
    color: #fff;
    text-align: center;
  }
</style>

<template>
  <div class="login">
    <div class="login-con">
      <Card icon="md-log-in" title="欢迎登录" :size="200" :bordered="false">
        <div class="form-con">
          <login-form @on-success-valid="handleSubmit"></login-form>
          <p class="login-tip">用户admin密码123456</p>
        </div>
      </Card>
    </div>
    <a :href="'#'">粤My Creation</a>
  </div>
</template>
<script>
import LoginForm from '_c/login-form'
import { mapActions } from 'vuex'
export default {
  components: {
    LoginForm
  },
  methods: {
    ...mapActions([
      'handleLogin',
      'getUserInfo'
    ]),
    handleSubmit ({ userName, password }) {
      this.handleLogin({ userName, password }).then(res => {
        this.getUserInfo().then(res => {
          this.$router.push({
            name: this.$config.homeName
          })
        })
      })
    }
  }
}
</script>

<style>

</style>
