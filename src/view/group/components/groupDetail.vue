<template>
<Row>
  <i-col span="24">
    <Button-group>
      <Button type="primary" icon="plus" @click="handlerAdd">添加</Button>
      <Button type="primary" icon="edit" @click="handlerEdit">编辑</Button>
      <Button type="primary" icon="delete" @click="handleDelete">删除</Button>
      <Button type="warning" icon="person" @click="handlerUser">关联用户</Button>
      <Button type="error" icon="locked" @click="handlerAuthority">权限下发</Button>
    </Button-group>
  </i-col>
  <i-col span="8" style='margin-top:15px;'>
    <i-input
      placeholder="角色" readonly disabled>
    </i-input>
    <Tree :data="treeData" ref="groupTree" @on-select-change="getNodeData"></Tree>
  </i-col>
  <i-col span="16" style='margin-top:15px;'>
    <Form :model="form" ref="form" :rules="rules" :label-width="80">
      <Form-item label="名称" prop="name">
        <i-input v-model="form.name" :disabled="formEdit" placeholder="请填写组名称"></i-input>
      </Form-item>
      <Form-item label="编码" prop="code">
        <i-input v-model="form.code" :disabled="formEdit" placeholder="请填写编码"></i-input>
      </Form-item>
      <Form-item label="描述" prop="description">
        <i-input v-model="form.description" :disabled="formEdit" placeholder="描述"></i-input>
      </Form-item>
      <Form-item v-if="formStatus == 'update'">
        <Button type="primary" @click="update('form')">更新</Button>
        <Button @click="onCancel">取消</Button>
      </Form-item>
      <Form-item v-if="formStatus == 'create'">
        <Button type="primary" @click="create('form')">保存</Button>
        <Button @click="onCancel">取消</Button>
      </Form-item>
    </Form>
  </i-col>
  <Modal v-model="dialogUserVisible" :closable="false" :title="dialogUserName" :mask-closable="false">
    <group-user :groupId="currentId" @closeUserDialog="closeUserDialog" ref="groupUser"></group-user>
    <div slot="footer">
      <Button @click="onDialogUserCancle" type="ghost">关 闭</Button>
    </div>
  </Modal>
  <Modal v-model="dialogAuthorityVisible" :closable="false" :title="dialogAuthorityName" :mask-closable="false">
    <group-authority :groupId="currentId" @closeAuthorityDialog="closeAuthorityDialog" ref="groupAuthority">
    </group-authority>
    <div slot="footer">
      <Button @click="onDialogAuthorityCancle" type="ghost">关 闭</Button>
    </div>
  </Modal>
</Row>
</template>

<script>
// import {
//   fetchTree,
//   getObj,
//   addObj,
//   delObj,
//   putObj
// } from '@/api/group/index'
// import { mapGetters } from 'vuex'
export default {
  name: 'groupDetail',
  components: {
    'group-user': () => import('./groupUser'),
    'group-authority': () => import('./groupAuthority')
  },
  props: {
    type: {
      default: '1'
    }
  },
  data () {
    return {
      list: null,
      total: null,
      formEdit: true,
      formStatus: '',
      dialogUserVisible: false,
      dialogUserName: '关联用户',
      dialogAuthorityVisible: false,
      dialogAuthorityName: '权限下发',
      listQuery: {
        groupType: this.type,
        name: undefined
      },
      treeData: [],
      rules: {
        name: [{
          required: true,
          message: '请填写组名称',
          trigger: 'blur'
        }
        ],
        code: [{
          required: true,
          message: '请填写编码',
          trigger: 'blur'
        }
        ]
      },
      form: {
        code: undefined,
        name: undefined,
        description: undefined,
        groupType: this.type
      },
      currentId: -1
    }
  },
  created () {
    // this.getTree()
    // console.log(this.treeData)
  },
  computed: {
    // ...mapGetters([
    //   'elements'
    // ])
  },
  methods: {
    getTree () {
      fetchTree(this.listQuery).then(response => {
        const obj = response.data
        if (obj.status === 200) {
          this.treeData = obj.data
          console.log(this.treeData)
        } else {
          this.$Notice.error({
            title: '错误',
            desc: obj.errmsg
          })
        }
      })
    },
    getNodeData (data) {
      let gourpId = data[0].id
      if (!this.formEdit) {
        this.formStatus = 'update'
      }
      getObj(gourpId).then(response => {
        const obj = response.data
        if (obj.status === 200) {
          this.form = obj.data
        } else {
          this.$Notice.error({
            title: '错误',
            desc: obj.errmsg
          })
        }
      })
      this.currentId = gourpId
      let nodeArr = this.$refs.groupTree.getSelectedNodes()
      nodeArr[0].selected = false
    },
    handlerEdit () {
      if (this.form.id) {
        this.formEdit = false
        this.formStatus = 'update'
      } else {
        this.$Message.warning('请选择分组')
        this.formEdit = true
        this.formStatus = ''
      }
    },
    handlerAdd () {
      this.resetForm()
      this.formEdit = false
      this.formStatus = 'create'
    },
    handleDelete () {
      this.$Modal.confirm({
        title: '提示',
        content: '此操作将永久删除, 是否继续?',
        onOk: () => {
          delObj(this.currentId).then((response) => {
            const obj = response.data
            if (obj.status === 200) {
              this.getTree()
              this.resetForm()
              this.onCancel()
              this.currentId = -1
              this.$Message.info('删除成功')
            } else {
              this.$Notice.error({
                title: '错误',
                desc: obj.message
              })
            }
          })
        },
        onCancel: () => {
          this.$Message.info('取消成功')
        }
      })
    },
    create (formName) {
      const set = this.$refs
      set[formName].validate(valid => {
        if (valid) {
          addObj(this.form).then((response) => {
            const obj = response.data
            if (obj.status === 200) {
              this.getTree()
              this.$Message.info('创建成功')
            } else {
              this.$Notice.error({
                title: '错误',
                desc: obj.message
              })
            }
          })
        } else {
          return false
        }
      })
    },
    update (formName) {
      const set = this.$refs
      this.form.crtTime = undefined
      this.form.updTime = undefined
      set[formName].validate(valid => {
        if (valid) {
          putObj(this.form).then((response) => {
            const obj = response.data
            if (obj.status === 200) {
              this.getTree()
              this.$Message.info('修改成功')
            } else {
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
    onCancel () {
      this.formEdit = true
      this.formStatus = ''
    },
    resetForm () {
      this.form = {
        parentId: this.currentId,
        code: undefined,
        name: undefined,
        description: undefined,
        groupType: this.type
      }
    },
    handlerUser () {
      if (this.currentId === -1) {
        this.$Message.warning('请先选择分组')
        return
      }
      this.dialogUserVisible = true
      if (this.$refs.groupUser !== undefined) {
        this.$refs.groupUser.groupId = this.currentId
        this.$refs.groupUser.initUsers()
      }
    },
    handlerAuthority () {
      if (this.currentId === -1) {
        this.$Message.warning('请先选择分组')
        return
      }
      this.dialogAuthorityVisible = true
      if (this.$refs.groupAuthority !== undefined) {
        this.$refs.groupAuthority.groupId = this.currentId
        this.$refs.groupAuthority.getTree()
      }
    },
    closeUserDialog () {
      this.dialogUserVisible = false
    },
    closeAuthorityDialog () {
      this.dialogAuthorityVisible = false
    },
    onDialogAuthorityCancle  () {
      this.dialogAuthorityVisible = false
      this.$refs.groupAuthority.clearList()
    },
    onDialogUserCancle () {
      this.dialogUserVisible = false
      this.$refs.groupUser.clearArr()
    }
  }
}
</script>
<style>
</style>
