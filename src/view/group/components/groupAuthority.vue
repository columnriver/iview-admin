<template>
<Row>
  <i-col span="24">
    <Button type="primary" @click="update">保存</Button>
  </i-col>
  <i-col span="8" style='margin-top:15px;'>
    <Tree :data="treeData" ref="menuTree" @on-select-change="getNodeData" show-checkbox></Tree>
  </i-col>
  <i-col span="16" style='margin-top:15px;'>
    <i-table @on-select="handleSelectionCheck" @on-select-cancel="handleSelectionCancle" stripe :columns="tableColumns" highlight-row :data="list">
    </i-table>
  </i-col>
</Row>
</template>

<script>

// import {
//   page
// } from '@/api/element/index'
// import {
//   removeElementAuthority,
//   addElementAuthority,
//   getElementAuthority,
//   modifyMenuAuthority,
//   getMenuAuthorityInAll
// } from '@/api/group/index'
// import { mapGetters } from 'vuex'
export default {
  name: 'groupAuthority',
  props: {
    groupId: {
      default: '1'
    }
  },
  data () {
    return {
      tableColumns: [
        {
          type: 'selection',
          width: 60,
          align: 'center'
        },
        {
          title: '资源编码',
          align: 'center',
          key: 'code'
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
        }
      ],
      list: [],
      total: null,
      listQuery: {
        limit: 10,
        page: 1,
        name: undefined,
        menuId: undefined
      },
      treeData: [],
      currentId: -1
    }
  },
  // computed: {
  //   ...mapGetters([
  //     'elements'
  //   ])
  // },
  methods: {
    getTree () {
      getMenuAuthorityInAll(this.groupId, this.listQuery).then(response => {
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
      this.listQuery.menuId = data[0].id
      page(this.listQuery).then(response => {
        const obj = response.data
        if (obj.status === 200) {
          getElementAuthority(this.groupId).then(resp => {
            const res = resp.data
            if (res.status === 200) {
              for (let i = 0; i < obj.data.rows.length; i++) {
                for (let j = 0; j < res.data.length; j++) {
                  if (obj.data.rows[i].id === res.data[j]) {
                    console.log(obj.data.rows[i].id === res.data[j])
                    obj.data.rows[i]._checked = true
                    break
                  }
                }
              }
              this.list = obj.data.rows
              console.log(this.list)
            } else {
              this.$Notice.error({
                title: '错误',
                desc: obj.errmsg
              })
            }
          })
        } else {
          this.$Notice.error({
            title: '错误',
            desc: obj.errmsg
          })
        }
      })
    },
    handleSelectionCheck (val, row) {
      addElementAuthority(this.groupId, {
        elementId: row.id
      })
    },
    handleSelectionCancle (val, row) {
      removeElementAuthority(this.groupId, {
        elementId: row.id
      })
    },
    update () {
      this.$emit('closeAuthorityDialog')
      const nodes = this.$refs.menuTree.getCheckedNodes()
      console.log(nodes)
      const ids = []
      for (let i = 0; i < nodes.length; i++) {
        ids.push(nodes[i].id)
      }
      modifyMenuAuthority(this.groupId, {
        menuTrees: ids.join()
      }).then(() => {
        this.$Message.info('修改成功')
      })
    },
    clearList () {
      this.list = []
      console.log(this.list)
    }
  }

}
</script>

<style>

</style>
