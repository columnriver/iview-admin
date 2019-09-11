<template>
<div>
  <Card>
    <p slot="title">
      <Icon type="person"></Icon>
      个人信息
    </p>
    <div>
      <Form
        ref="form"
        :model="form"
        :label-width="100"
        label-position="right"
        :rules="rules"
      >
        <FormItem label="登录账号：" prop="username">
          <div style="display:inline-block;width:300px;">
            <i-input v-model="form.username" disabled ></i-input>
          </div>
        </FormItem>
        <FormItem label="用户姓名：" prop="name">
          <div style="display:inline-block;width:300px;">
            <i-input v-model="form.name" ></i-input>
          </div>
        </FormItem>
        <FormItem label="用户手机：" prop="mobilePhone" >
          <div style="display:inline-block;width:204px;">
            <i-input v-model="form.mobilePhone"></i-input>
          </div>
        </FormItem>
        <FormItem label="邮箱：" prop="email" >
          <div style="display:inline-block;width:204px;">
            <i-input v-model="form.email"></i-input>
          </div>
        </FormItem>
        <!-- :headers="token" -->
        <FormItem label="修改头像：">
          <Upload
            ref="upload"
            multiple
            :show-upload-list="false"
            :on-success="handleSuccess"
            :format="['jpg','jpeg','png']"
            :max-size="4048"
            :on-progress="handleProgress"
            :on-format-error="handleFormatError"
            :on-exceeded-size="handleMaxSize"
            :before-upload="handleBeforeUpload"
            type="drag"
            :action="upload_url"
            style="display: inline-block;width:95px;">
            <div style="width: 95px;height:95px;line-height: 95px;">
              <div class="upload-list">
                <template v-if="upload.status === 'finished'">
                  <template v-if="form.headImage">
                    <img :src="form.headImage">
                    <div class="upload-list-cover">
                        <Icon type="ios-eye-outline" @click.native="handleView(form.headImage)"></Icon>
                        <Icon type="ios-trash-outline" @click.native="handleRemove(form.headImage)"></Icon>
                    </div>
                  </template>
                  <template v-else>
                    <Icon type="camera" size="36"></Icon>
                  </template>
                </template>
                <template v-else>
                  <Progress v-if="upload.showProgress" :percent="upload.percentage" hide-info></Progress>
                </template>
              </div>
            </div>
          </Upload>
        </FormItem>
        <FormItem label="登录密码：">
          <Button type="text" size="small" @click="showEditPassword">修改密码</Button>
        </FormItem>
        <div>
          <Button type="text" style="width: 100px;" @click="cancelEditUserInfor">取消</Button>
          <Button type="primary" style="width: 100px;" :loading="save_loading" @click="saveEdit">保存</Button>
        </div>
      </Form>
    </div>
  </Card>
  <Modal v-model="editPasswordModal" :closable='false' :mask-closable=false :width="500">
    <h3 slot="header" style="color:#2D8CF0">修改密码</h3>
    <Form ref="editPasswordForm" :model="editPasswordForm" :label-width="100" label-position="right" :rules="passwordValidate">
      <FormItem label="原密码" prop="oldPass" :error="oldPassError">
        <i-input v-model="editPasswordForm.oldPass" placeholder="请输入现在使用的密码" ></i-input>
      </FormItem>
      <FormItem label="新密码" prop="newPass">
        <i-input v-model="editPasswordForm.newPass" placeholder="请输入新密码，至少6位字符" ></i-input>
      </FormItem>
      <FormItem label="确认新密码" prop="rePass">
        <i-input v-model="editPasswordForm.rePass" placeholder="请再次输入新密码" ></i-input>
      </FormItem>
    </Form>
    <div slot="footer">
      <Button type="text" @click="cancelEditPass">取消</Button>
      <Button type="primary" :loading="savePassLoading" @click="saveEditPass">保存</Button>
    </div>
  </Modal>
</div>
</template>
<script>
import { mapGetters } from 'vuex'
// import {
//   getObj,
//   putMyselfPasswordfObj,
//   putMyselfObj
// } from '@/api/user/index'
// import { getToken } from '@/utils/token' // 验权
export default {
  name: 'ownspace_index',
  data () {
    const valideRePassword = (rule, value, callback) => {
      if (value !== this.editPasswordForm.newPass) {
        callback(new Error('两次输入密码不一致'))
      } else {
        callback()
      }
    }
    return {
      upload_url: process.env.BASE_API + '/upload/picture',
    //  token: {
    //     token: getToken()
    //   },
      form: {
        username: '',
        name: '',
        mobilePhone: '',
        headImage: '',
        email: ''
      },
      upload: {
        status: 'finish',
        showProgress: false,
        percentage: ''
      },
      uid: '', // 登录用户的userId
      save_loading: false,
      editPasswordModal: false, // 修改密码模态框显示
      savePassLoading: false,
      oldPassError: '',
      rules: {
        name: [
          { required: true, message: '请输入姓名', trigger: 'blur' }
        ]
      },
      editPasswordForm: {
        oldPass: '',
        newPass: '',
        rePass: ''
      },
      passwordValidate: {
        oldPass: [
          { required: true, message: '请输入原密码', trigger: 'blur' }
        ],
        newPass: [
          { required: true, message: '请输入新密码', trigger: 'blur' },
          { min: 6, message: '请至少输入6个字符', trigger: 'blur' },
          { max: 32, message: '最多输入32个字符', trigger: 'blur' }
        ],
        rePass: [
          { required: true, message: '请再次输入新密码', trigger: 'blur' },
          { validator: valideRePassword, trigger: 'blur' }
        ]
      }
    }
  },
  created () {
    // this.uid = this.userId
    // this.init()
    console.log(this.$store.state.user)
    this.upload.status = 'finished'
    this.form.name = this.$store.state.user.userName
    this.form.mobilePhone = this.$store.state.user.mobilePhone
    this.form.email = this.$store.state.user.email
    this.form.headImage = this.$store.state.user.avatorImgPath
  },
  computed: {
    ...mapGetters([
      'errorCount'
    ])
  },
  methods: {
    init () {
      getObj(this.uid).then(response => {
        const obj = response.data
        if (obj.status === 200) {
          this.form = obj.data
          this.upload.status = 'finished'
          console.log(this.form)
        } else {
          this.$Notice.error({
            title: '错误',
            desc: obj.message
          })
        }
      })
    },
    showEditPassword () {
      console.log(this.uid)
      this.editPasswordModal = true
    },
    cancelEditUserInfor () {
      // this.$store.commit('removeTag', 'ownspace_index')
      // localStorage.pageOpenedList = JSON.stringify(this.$store.state.app.pageOpenedList)
      let lastPageName = 'home'
      // if (this.$store.state.app.pageOpenedList.length > 1) {
      //   lastPageName = this.$store.state.app.pageOpenedList[1].name
      // } else {
      //   lastPageName = this.$store.state.app.pageOpenedList[0].name
      // }
      this.$router.push({
        name: lastPageName
      })
    },
    saveEdit () {
      this.$refs['form'].validate((valid) => {
        if (valid) {
          this.save_loading = true
          this.form.crtTime = undefined
          this.form.updTime = undefined
          putMyselfObj(this.form).then((response) => {
            const obj = response.data
            if (obj.status === 200) {
              this.save_loading = false
              this.$store.commit('SET_NAME', this.form.name)
              this.$store.commit('SET_AVATAR', this.form.headImage)
              this.$Message.info('修改成功')
            } else {
              this.save_loading = false
              this.$Notice.error({
                title: '错误',
                message: obj.errmsg
              })
            }
          })
        } else {
          return false
        }
      })
    },
    cancelEditPass () {
      this.editPasswordModal = false
    },
    saveEditPass () {
      this.$refs['editPasswordForm'].validate((valid) => {
        if (valid) {
          this.savePassLoading = true
          let psObj = {
            id: this.uid,
            newPass: this.editPasswordForm.newPass,
            oldPass: this.editPasswordForm.oldPass
          }
          putMyselfPasswordfObj(psObj).then((response) => {
            const obj = response.data
            if (obj.status === 200) {
              this.savePassLoading = false
              this.$Message.info('修改成功')
            } else {
              this.savePassLoading = false
              this.$Notice.error({
                title: '错误',
                message: obj.errmsg
              })
            }
          })
        } else {
          return false
        }
      })
    },
    handleSuccess (res, file) {
      this.upload.status = file.status
      this.upload.showProgress = file.showProgress
      this.upload.percentage = file.percentage
      if (res.status === 200) {
        this.form.headImage = res.data[0]
      } else {
        this.$Notice.warning({
          title: '上传失败',
          desc: res.message
        })
      }
      console.log(file)
    },
    handleFormatError (file) {
      this.$Notice.warning({
        title: '文件格式不正确',
        desc: '文件 ' + file.name + ' 格式不正确，请上传 jpg 或 png 格式的图片。'
      })
    },
    handleMaxSize (file) {
      this.$Notice.warning({
        title: '超出文件大小限制',
        desc: '文件 ' + file.name + ' 太大，不能超过 2M。'
      })
    },
    handleProgress (event, file, fileList) {
      console.log(file)
      this.upload.percentage = file.percentage
    },
    handleBeforeUpload () {
      this.upload.status = 'uploading'
      this.upload.percentage = 0
      this.upload.showProgress = true
    }
  }
}
</script>

<style lang="less" >
//   @import "~@/style/own-space/index.less";
.own-space{
  &-btn-box{
      margin-bottom: 10px;
      button{
          padding-left: 0;
          span{
              color: #2D8CF0;
              transition: all .2s;
          }
          span:hover{
              color: #0C25F1;
              transition: all .2s;
          }
      }
  }
  &-tra{
      width:10px;
      height:10px;
      transform:rotate(45deg);
      position:absolute;
      top:50%;
      margin-top:-6px;
      left:-3px;
      box-shadow:0 0 2px 3px rgba(0,0,0,.1);
      background-color:white;z-index:100;
  }
  &-input-identifycode-con{
      position:absolute;
      width:200px;
      height:100px;
      right:-220px;
      top:50%;
      margin-top:-50px;
      border-radius:4px;
      box-shadow:0 0 2px 3px rgba(0,0,0,.1);
  }
}
  .upload-list{
        display: inline-block;
        width: 97px;
        height: 97px;
        text-align: center;
        line-height: 97px;
        border: 1px solid transparent;
        border-radius: 4px;
        overflow: hidden;
        background: #fff;
        position: relative;
        box-shadow: 0 1px 1px rgba(0,0,0,.2);
        margin-right: 4px;
    }
    .upload-list img{
        width: 100%;
        height: 100%;
    }
    .upload-list-cover{
        display: none;
        position: absolute;
        top: 0;
        bottom: 0;
        left: 0;
        right: 0;
        background: rgba(0,0,0,.6);
    }
    .upload-list:hover .demo-upload-list-cover{
        display: block;
    }
    .upload-list-cover i{
        color: #fff;
        font-size: 20px;
        cursor: pointer;
        margin: 0 2px;
    }
</style>
