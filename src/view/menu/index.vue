<template>
<div>
  <Row>
    <i-col span="8">
      <Card>
        <Button-group>
          <Button type="primary" icon="plus" @click="handlerAdd">添加</Button>
          <Button type="primary" icon="edit" @click="handlerEdit">编辑</Button>
          <Button type="primary" icon="delete" @click="handleDelete">删除</Button>
        </Button-group>
        <i-input
          placeholder="菜单" readonly disabled style="padding-top:10px">
        </i-input>
        <Tree :data="treeData" ref="menuTree" @on-select-change="getNodeData"></Tree>
      </Card>
    </i-col>
    <i-col span="16">
      <Card>
        <Form :model="form" ref="form" :rules="rules" :label-width="80">
          <Form-item label="路径编码" prop="code">
            <i-input v-model="form.code" :disabled="formEdit" placeholder="请填写路径编码"></i-input>
          </Form-item>
          <Form-item label="标题" prop="title">
            <i-input v-model="form.title" :disabled="formEdit" placeholder="请填写标题"></i-input>
          </Form-item>
          <Form-item label="父级节点" prop="parentId">
            <i-input v-model="form.parentId" :disabled="formEdit" placeholder="请填写父级节点"></i-input>
          </Form-item>
          <Form-item label="图标" prop="icon">
            <i-input v-model="form.icon" :disabled="formEdit" placeholder="请填写图标"></i-input>
          </Form-item>
          <Form-item label="资源路径" prop="href">
            <i-input v-model="form.href" :disabled="formEdit" placeholder="请填写资源路径"></i-input>
          </Form-item>
          <Form-item label="类型" prop="type">
            <Select v-model="form.type" :disabled="formEdit" placeholder="请选择资源请求类型">
              <Option v-for="item in typeOptions" :key="item" :label="item" :value="item"> </Option>
            </Select>
          </Form-item>
          <Form-item label="排序" prop="orderNum">
            <InputNumber v-model="form.orderNum" :disabled="formEdit" :max="99" :min="0"></InputNumber>
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
      </Card>
      <Card>
        <menu-element :menuId='currentId' ref="menuElement"></menu-element>
      </Card>
    </i-col>
  </Row>
</div>
</template>

<script>
// import {
//   fetchTree, getObj, addObj, delObj, putObj
// } from '@/api/menu/index'
// import { mapGetters } from 'vuex'
export default {
  name: 'menu_page',
  components: {
    'menu-element': () => import('./components/element')
  },
  data () {
    return {
      formEdit: true,
      formAdd: true,
      formStatus: '',
      treeData: [],
      typeOptions: ['menu', 'dirt'],
      listQuery: {
        title: undefined
      },
      rules: {
        code: [{
          required: true,
          message: '请填写路径编码',
          trigger: 'blur'
        }
        ],
        title: [{
          required: true,
          message: '请填写菜单标题',
          trigger: 'blur'
        }
        ],
        href: [{
          required: true,
          message: '请填写资源路径',
          trigger: 'blur'
        }
        ],
        type: [{
          required: true,
          message: '请选择菜单类型',
          trigger: 'blur'
        }
        ]
      },
      form: {
        code: undefined,
        title: undefined,
        parentId: undefined,
        href: undefined,
        icon: undefined,
        orderNum: undefined,
        description: undefined,
        path: undefined,
        enabled: undefined,
        type: undefined
      },
      currentId: -1
    }
  },
  created () {
    // this.getTree()
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
        } else {
          this.$Notice.error({
            title: '错误',
            desc: obj.errmsg
          })
        }
      })
    },
    getNodeData (data) {
      let menuId = data[0].id
      if (!this.formEdit) {
        this.formStatus = 'update'
      }
      getObj(menuId).then(response => {
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
      this.currentId = menuId
      this.showElement = true
      this.$refs.menuElement.menuId = menuId
      this.$refs.menuElement.getList()
      let nodeArr = this.$refs.menuTree.getSelectedNodes()
      nodeArr[0].selected = false
    },
    handlerEdit () {
      if (this.form.id) {
        this.formEdit = false
        this.formStatus = 'update'
      } else {
        this.$Message.warning('请选择菜单')
        this.formEdit = true
        this.formStatus = ''
        this.form.parentId = undefined
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
      this.form.menuId = this.menuId
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
        code: undefined,
        title: undefined,
        parentId: this.currentId,
        href: undefined,
        icon: undefined,
        orderNum: undefined,
        description: undefined,
        path: undefined,
        enabled: undefined,
        type: undefined
      }
    }
  }
}
</script>

<style>

</style>
