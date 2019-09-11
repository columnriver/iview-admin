<template>
<Form :label-width="80">
  <Form-item label="管理|领导">
    <Select
      placeholder="请输入关键词"
      v-model="leaders"
      filterable
      remote
      multiple
      :remote-method="remoteLeaderMethod"
      :loading="loading">
      <Option v-for="option in lItems" :value="option.id" :key="option.id">{{option.name}}</Option>
    </Select>
  </Form-item>
  <Form-item label="组员|下属">
    <Select
      placeholder="请输入关键词"
      v-model="members"
      filterable
      multiple
      remote
      :remote-method="remoteMemberMethod"
      :loading="loading">
      <Option v-for="option in mItems" :value="option.id" :key="option.id">{{option.name}}</Option>
    </Select>
  </Form-item>
  <Form-item>
    <Button type="primary" @click="onSubmit">保存</Button>
  </Form-item>
</Form>
</template>

<script>
// import {
//   search
// } from '@/api/user/index'
// import {
//   getUsers,
//   modifyUsers
// } from '@/api/group/index'
export default {
  props: {
    groupId: {
      default: '1'
    }
  },
  data () {
    return {
      leaders: [],
      mItems: [],
      lItems: [],
      members: [],
      loading: false
    }
  },
  methods: {
    remoteMemberMethod (query) {
      if (query !== '') {
        this.loading = true
        search({
          keyword: query
        }).then(response => {
          const obj = response.data
          if (obj.status === 200) {
            this.mItems = obj.data
            this.loading = false
          } else {
            this.$Notice.error({
              title: '错误',
              message: obj.errmsg
            })
          }
        })
      } else {
        this.mItems = []
      }
    },
    remoteLeaderMethod (query) {
      if (query !== '') {
        this.loading = true
        search({
          keyword: query
        }).then(response => {
          const obj = response.data
          if (obj.status === 200) {
            this.lItems = obj.data
            this.loading = false
          } else {
            this.$Notice.error({
              title: '错误',
              message: obj.errmsg
            })
          }
        })
      } else {
        this.lItems = []
      }
    },
    onSubmit () {
      const vals = {}
      if (this.members.length > 0) vals.members = this.members.join()
      if (this.leaders.length > 0) vals.leaders = this.leaders.join()
      modifyUsers(this.groupId, vals).then(() => {
        this.$emit('closeUserDialog')
        this.$Message.info('保存成功')
      })
    },
    initUsers () {
      getUsers(this.groupId).then(response => {
        const obj = response.data
        if (obj.status === 200) {
          this.lItems = obj.data.leaders
          this.mItems = obj.data.members
          const mems = []
          const leas = []
          for (let i = 0; i < obj.data.members.length; i++) {
            mems.push(obj.data.members[i].id)
          }
          for (let i = 0; i < obj.data.leaders.length; i++) {
            leas.push(obj.data.leaders[i].id)
          }
          this.members = mems
          this.leaders = leas
        } else {
          this.$Notice.error({
            title: '错误',
            message: obj.errmsg
          })
        }
      })
    },
    clearArr () {
      this.leaders = []
      this.mItems = []
      this.lItems = []
      this.members = []
    }
  }
}
</script>

<style>

</style>
