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
          placeholder="基础字典类型列表" readonly disabled style="padding-top:10px">
        </i-input>
        <Tree :data="treeData" ref="dictTree" @on-select-change="getNodeData"></Tree>
      </Card>
    </i-col>
    <i-col span="16">
      <Card>
        <Form :model="form" ref="form" :rules="rules" :label-width="80">
          <Form-item label="类型代码" prop="code">
            <i-input v-if="formStatus == 'update'" v-model="form.code" :disabled="true" placeholder="请填写字典代码"></i-input>
            <i-input v-else v-model="form.code" :disabled="formEdit" placeholder="请填写字典代码"></i-input>
          </Form-item>
          <Form-item label="类型名称" prop="name">
            <i-input v-model="form.name" :disabled="formEdit" placeholder="请填写类型名称"></i-input>
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
        <dict-info :dictId='currentId' ref="dictElement"></dict-info>
      </Card>
    </i-col>
  </Row>
</div>
</template>

<script>
// import {
//   fetchTree, getObj, addObj, delObj, putObj
// } from '@/api/dictionary/index'
// import { mapGetters } from 'vuex'
export default {
  name: 'dictionary_page',
  components: {
    // 'dict-info': () => import('./components/dictinfo')
  },
  data () {
    return {
      formEdit: true,
      formStatus: '',
      treeData: [],
      listQuery: {
        title: undefined
      },
      rules: {
        code: [{
          required: true,
          message: '请填写类型代码',
          trigger: 'blur'
        }
        ],
        name: [{
          required: true,
          message: '请填写类型名称',
          trigger: 'blur'
        }
        ]
      },
      form: {
        code: undefined,
        name: undefined,
        description: undefined
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
        } else {
          this.$Notice.error({
            title: '错误',
            desc: obj.errmsg
          })
        }
      })
    },
    getNodeData (data) {
      let dictId = data[0].id
      if (!this.formEdit) {
        this.formStatus = 'update'
      }
      getObj(dictId).then(response => {
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
      this.currentId = dictId
      this.showElement = true
      this.$refs.dictElement.dictId = dictId
      this.$refs.dictElement.getList()
      let nodeArr = this.$refs.dictTree.getSelectedNodes()
      nodeArr[0].selected = false
    },
    handlerEdit () {
      if (this.form.id) {
        this.formEdit = false
        this.formStatus = 'update'
      } else {
        this.$Message.warning('请选择字典类型')
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
        name: undefined,
        description: undefined
      }
    }
  }
}
</script>

<style>

</style>
