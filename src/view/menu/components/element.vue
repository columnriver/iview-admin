<template>
<div>
  <div class="filter-container">
    <i-input @on-enter="handleFilter"   v-model="listQuery.keyword" placeholder="资源名称" class="filter-item" style="width:200px"></i-input>
    <Button type="primary" class="filter-item" icon="ios-search" @click="handleFilter">搜索</Button>
    <Button type="primary" class="filter-item"  style="margin-left: 10px;" icon="plus" @click="handleCreate">添加</Button>
  </div>
  <i-table stripe :columns="tableColumns" highlight-row :data="list">
  </i-table>
  <div style="margin: 10px;overflow: hidden">
    <div style="float: right;">
      <Page :total="total" :current="listQuery.page" size="small" @on-change="handleCurrentChange"
      @on-page-size-change="handleSizeChange" show-sizer></Page>
    </div>
  </div>
  <Modal v-model="dialogFormVisible" :closable="false" :mask-closable="false" :title="textMap[dialogStatus]" :loading="listLoading">
    <Form :model="form" :rules="rules" ref="form" :label-width="100">
      <Form-item label="资源编码" prop="code">
        <i-input v-model="form.code" placeholder="请填写资源编码"></i-input>
      </Form-item>
      <Form-item label="资源类型" prop="type">
        <Select v-model="form.type" placeholder="请选择资源类型">
          <Option v-for="item in typeOptions" :key="item" :label="item" :value="item"> </Option>
        </Select>
      </Form-item>
      <Form-item label="资源名称" prop="name">
        <i-input v-model="form.name" placeholder="请填写资源名称"></i-input>
      </Form-item>
      <Form-item label="资源地址" prop="uri">
        <i-input v-model="form.uri" placeholder="请填写资源地址"></i-input>
      </Form-item>
      <Form-item label="资源请求类型" prop="method">
        <Select class="filter-item" v-model="form.method" placeholder="请选择资源请求类型">
          <Option v-for="item in methodOptions" :key="item" :label="item" :value="item"> </Option>
        </Select>
      </Form-item>
      <Form-item label="描述" prop="description">
        <i-input v-model="form.description" placeholder="描述"></i-input>
      </Form-item>
    </Form>
    <div slot="footer">
      <Button @click="cancel('form')" type="ghost">取 消</Button>
      <Button v-if="dialogStatus=='create'" type="primary" @click="create('form')">确 定</Button>
      <Button v-else type="primary" @click="update('form')">确 定</Button>
    </div>
  </Modal>
</div>
</template>

<script>
// import {
//   page,
//   addObj,
//   getObj,
//   delObj,
//   putObj
// } from '@/api/element/index'
// import { mapGetters } from 'vuex'
export default {
  name: 'element-component',
  data () {
    return {
      methodOptions: ['GET', 'POST', 'PUT', 'DELETE'],
      typeOptions: ['uri', 'button'],
      tableColumns: [
        {
          title: '资源编码',
          align: 'center',
          key: 'code'
        },
        {
          title: '资源类型',
          align: 'center',
          key: 'type'
        },
        {
          title: '资源名称',
          align: 'center',
          key: 'name'
        },
        {
          title: '资源地址',
          align: 'center',
          key: 'uri'
        },
        {
          title: '资源请求类型',
          align: 'center',
          key: 'method'
        },
        {
          title: '描述',
          align: 'center',
          key: 'description'
        },
        {
          title: '操作',
          align: 'center',
          fixed: 'right',
          width: 200,
          key: 'updName',
          render: (h, params) => {
            return h('div', [
              h('Button', {
                props: {
                  type: 'primary',
                  size: 'small'
                },
                style: {
                  marginRight: '5px'
                },
                on: {
                  click: () => {
                    this.handleUpdate(params.row)
                  }
                }
              }, '编辑'),
              h('Button', {
                props: {
                  type: 'error',
                  size: 'small'
                },
                on: {
                  click: () => {
                    this.handleDelete(params.row)
                  }
                }
              }, '删除')
            ])
          }
        }
      ],
      form: {
        code: undefined,
        type: undefined,
        name: undefined,
        uri: undefined,
        menuId: undefined,
        method: undefined,
        description: undefined
      },
      rules: {
        code: [{
          required: true,
          message: '请填写资源编码',
          trigger: 'blur'
        }
        ],
        type: [{
          required: true,
          message: '请选择资源类型',
          trigger: 'blur'
        }
        ],
        name: [{
          required: true,
          message: '请填写资源名称',
          trigger: 'blur'
        },
        {
          min: 2,
          max: 20,
          message: '长度在 2 到 20 个字符',
          trigger: 'blur'
        }
        ],
        uri: [{
          required: true,
          message: '请填写资源地址',
          trigger: 'blur'
        }
        ],
        method: [{
          required: true,
          message: '请选择资源请求类型',
          trigger: 'blur'
        }
        ]
      },
      list: [],
      total: 0,
      listLoading: true,
      listQuery: {
        page: 1,
        limit: 20,
        keyword: undefined,
        menuId: this.menuId
      },
      dialogFormVisible: false,
      dialogStatus: '',
      menuId: -1,
      textMap: {
        update: '编辑',
        create: '创建'
      },
      tableKey: 0
    }
  },
  created () {
    // this.getList()
  },
  computed: {
    // ...mapGetters([
    //   'elements'
    // ])
  },
  methods: {
    getList () {
      this.listLoading = true
      this.listQuery.menuId = this.menuId
      page(this.listQuery).then(response => {
        const obj = response.data
        if (obj.status === 200) {
          this.list = obj.data.rows
          this.total = obj.data.total
          this.listLoading = false
        } else {
          this.$Notice.error({
            title: '错误',
            desc: obj.message
          })
        }
      })
    },
    handleFilter () {
      this.getList()
    },
    handleSizeChange (val) {
      this.listQuery.limit = val
      this.getList()
    },
    handleCurrentChange (val) {
      this.listQuery.page = val
      this.getList()
    },
    handleCreate () {
      this.resetTemp()
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
    },
    handleUpdate (row) {
      this.resetTemp()
      getObj(row.id).then(response => {
        const obj = response.data
        if (obj.status === 200) {
          this.form = obj.data
          this.dialogFormVisible = true
          this.dialogStatus = 'update'
        } else {
          this.$Notice.error({
            title: '错误',
            desc: obj.message
          })
        }
      })
    },
    handleDelete (row) {
      this.$Modal.confirm({
        title: '提示',
        content: '此操作将永久删除, 是否继续?',
        onOk: () => {
          delObj(row.id).then((response) => {
            const obj = response.data
            if (obj.status === 200) {
              this.$Message.info('删除成功')
              const index = this.list.indexOf(row)
              this.list.splice(index, 1)
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
    cancel (formName) {
      this.dialogFormVisible = false
      const set = this.$refs
      set[formName].resetFields()
    },
    create (formName) {
      const set = this.$refs
      this.form.menuId = this.menuId
      set[formName].validate(valid => {
        if (valid) {
          addObj(this.form).then((response) => {
            const obj = response.data
            if (obj.status === 200) {
              this.dialogFormVisible = false
              this.getList()
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
      set[formName].validate(valid => {
        if (valid) {
          putObj(this.form.id, this.form).then((response) => {
            const obj = response.data
            if (obj.status === 200) {
              this.dialogFormVisible = false
              this.getList()
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
    resetTemp () {
      this.form = {
        code: undefined,
        type: undefined,
        name: undefined,
        uri: undefined,
        menuId: undefined,
        method: undefined,
        description: undefined
      }
    }
  }
}
</script>

<style>

</style>
