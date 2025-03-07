<template>
  <div class="app-container">
    <div class="filter-container">
      <el-menu :default-active="listQuery.activeIndex" class="el-menu-demo" mode="horizontal" clearable @select="handleSelect">
        <el-menu-item index="0">全部订单</el-menu-item>
        <el-menu-item index="1">待付款</el-menu-item>
        <el-menu-item index="2">待发货</el-menu-item>
        <el-menu-item index="3">待收货</el-menu-item>
        <el-menu-item index="5">已完成</el-menu-item>
        <el-menu-item index="6">已取消</el-menu-item>
        <el-menu-item index="7">已退款</el-menu-item>
      </el-menu>
      <br>
      <el-radio-group v-model="listQuery.type" size="small" style="margin-bottom: 10px;" @change="handleFilter">
        <el-radio-button :label="0">普通订单</el-radio-button>
      </el-radio-group>
      <el-form :inline="true" :model="listQuery" class="demo-form-inline">
        <el-form-item label="订单信息">
          <el-input v-model="listQuery.title" placeholder="订单号、收货人等" clearable/>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleFilter">搜索</el-button>
        </el-form-item>
      </el-form>
    </div>
    <el-table
      v-loading="listLoading"
      ref="multipleTable"
      :key="tableKey"
      :data="list"
      border
      fit
      highlight-current-row
      style="width: 100%;"
      @sort-change="sortChange">
      <el-table-column type="expand">
        <template slot-scope="scope">
          <el-table
            ref="orderGoodsTable"
            :data="scope.row.goods_list"
            style="width: 100%;">
            <el-table-column label="商品" width="400">
              <template slot-scope="props">
                <div class="good-box">
                  <el-image :src="props.row.img" :preview-src-list="[props.row.img]" style="width:45px;height:45px;"/>
                  <div class="right">
                    <div>
                      <router-link :to="{ path: '/commodityManagement/good/goodDetail', query: { id: props.row.good_id }}" target="_blank"> {{ props.row.name }}</router-link>
                    </div>
                  </div>
                </div>
              </template>
            </el-table-column>
            <el-table-column label="类型" width="120">
              <template slot-scope="props">
                <div>{{ props.row.good.type }}</div>
              </template>
            </el-table-column>
            <el-table-column label="单价（元）" width="180">
              <template slot-scope="props">
                <div>{{ props.row.price }}</div>
              </template>
            </el-table-column>
            <el-table-column label="数量" width="120">
              <template slot-scope="props">
                <div>{{ props.row.number }}件</div>
              </template>
            </el-table-column>
          </el-table>
        </template>
      </el-table-column>
      <el-table-column label="编号" width="80" sortable="custom" prop="id">
        <template slot-scope="scope">
          <span>{{ scope.row.id }}</span>
        </template>
      </el-table-column>
      <el-table-column width="200" label="订单编号">
        <template slot-scope="scope">
          <span>{{ scope.row.identification }}</span>
        </template>
      </el-table-column>
      <el-table-column width="120" label="订单类型">
        <template slot-scope="scope">
          <span>{{ scope.row.type }}</span>
        </template>
      </el-table-column>
      <el-table-column width="120" label="订单状态" sortable="custom" prop="state">
        <template slot-scope="scope">
          <span>{{ scope.row.state_show }}</span>
        </template>
      </el-table-column>
      <el-table-column width="80" label="订单总额">
        <template slot-scope="scope">
          <span>{{ scope.row.total ? scope.row.total : 0 | 1000 }}</span>
        </template>
      </el-table-column>
      <el-table-column width="80" label="运费">
        <template slot-scope="scope">
          <span v-if="scope.row.carriage">{{ scope.row.carriage | 1000 }}</span>
          <span v-else>免运费</span>
        </template>
      </el-table-column>
      <el-table-column width="80" label="收货人">
        <template slot-scope="scope">
          <span>{{ scope.row.good_location ? scope.row.good_location.name : '' }}</span>
        </template>
      </el-table-column>
      <el-table-column width="180" label="手机号">
        <template slot-scope="scope">
          <span>{{ scope.row.good_location ? scope.row.good_location.cellphone : '' }}</span>
        </template>
      </el-table-column>
      <el-table-column width="200" label="地址">
        <template slot-scope="scope">
          <span>{{ scope.row.good_location ? scope.row.good_location.location : '' }}</span>
        </template>
      </el-table-column>
      <el-table-column width="80" label="快递公司">
        <template slot-scope="scope">
          <span>{{ scope.row.dhl ? scope.row.dhl.name : '' }}</span>
        </template>
      </el-table-column>
      <el-table-column width="180" label="运单号">
        <template slot-scope="scope">
          <span>{{ scope.row.odd }}</span>
        </template>
      </el-table-column>
      <el-table-column width="100" label="备注">
        <template slot-scope="scope">
          <span>{{ scope.row.remark }}</span>
        </template>
      </el-table-column>
      <el-table-column width="180" label="订单时间" sortable="custom" prop="created_at">
        <template slot-scope="scope">
          <span>{{ scope.row.created_at }}</span>
        </template>
      </el-table-column>
      <el-table-column fixed="right" label="操作" class-name="small-padding fixed-width" width="120">
        <template slot-scope="scope">
          <router-link v-permission="$store.jurisdiction.IndentDetail" :to="{ path: 'indentDetail', query: { id: scope.row.id }}">
            <el-tooltip class="item" effect="dark" content="订单详情" placement="top-start">
              <el-button type="warning" icon="el-icon-tickets" circle/>
            </el-tooltip>
          </router-link>
          <router-link v-if="scope.row.state === 2" :to="{ path: 'indentDetail', query: { id: scope.row.id }}">
            <el-tooltip class="item" effect="dark" content="发货" placement="top-start">
              <el-button type="primary" icon="el-icon-truck" circle/>
            </el-tooltip>
          </router-link>
        </template>
      </el-table-column>
    </el-table>

    <!--分页-->
    <div class="pagination-operation">
      <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" class="pagination" @pagination="getList"/>
    </div>
  </div>
</template>
<style lang='scss' scoped>
  .good-box{
    display: flex;
    .right{
      margin-left: 10px;
    }
  }
</style>

<script>
import { getList } from '@/api/indent'
import Pagination from '@/components/Pagination'
export default {
  name: 'IndentList',
  components: { Pagination },
  data() {
    return {
      dialogVisible: false,
      ruleForm: [],
      checkAll: false,
      tableKey: 0,
      list: null,
      total: 0,
      imgProgressPercent: 0,
      loading: false,
      listLoading: false,
      imgProgress: false,
      dialogStatus: '',
      dialogFormVisible: false,
      listQuery: {
        page: 1,
        limit: 10,
        sort: '-id',
        activeIndex: '0',
        type: 0
      },
      temp: {}
    }
  },
  created() {
    this.getList()
  },
  methods: {
    getList() {
      this.listLoading = true
      getList(this.listQuery).then(response => {
        this.list = response.data.data
        this.total = response.data.total
        this.listLoading = false
      })
    },
    handleFilter() {
      this.listQuery.page = 1
      this.getList()
    },
    sortChange(data) {
      const { prop, order } = data
      if (order === 'ascending') {
        this.listQuery.sort = '+' + prop
      } else {
        this.listQuery.sort = '-' + prop
      }
      this.handleFilter()
    },
    handleSelect(key, keyPath) {
      this.listQuery.activeIndex = key
      this.handleFilter()
    },
    resetTemp() {
      this.temp = {
        state: 0,
        sort: '5',
        img: ''
      }
    }
  }
}
</script>
