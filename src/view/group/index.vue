<template>
<Card>
  <div class="tab-container">
    <Tabs style='margin-top:15px;' v-model="activeName"  type="card">
      <Tab-pane v-for="item in tabMapOptions" :label="item.name" :key='item.id' :name="item.code">
        <keep-alive>
          <tab-pane v-if='activeName==item.code' :type='item.id'></tab-pane>
        </keep-alive>
      </Tab-pane>
    </Tabs>
  </div>
</Card>
</template>

<script>
import tabPane from './components/groupDetail'
// import {
//   getAllGroupTypes
// } from '@/api/group/index'
export default {
  name: 'group',
  components: {
    tabPane
  },
  data () {
    return {
      tabMapOptions: [
      ],
      activeName: 'GROUP_ROLE'
    }
  },
  created () {
    // this.fetchData()
  },
  methods: {
    fetchData () {
      getAllGroupTypes().then(response => {
        const obj = response.data
        if (obj.status === 200) {
          this.tabMapOptions = obj.data
        } else {
          this.$Notice.error({
            title: '错误',
            desc: obj.message
          })
        }
      })
    }
  }
}
</script>

<style scoped>
.tab-container {
  margin: 30px;
}
</style>
