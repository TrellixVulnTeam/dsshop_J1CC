import {detail, receipt, download} from '@/api/goodIndent'
export default {
  layout: 'user',
  head () {
    return {
      title: '订单详情-个人中心',
    }
  },
  data() {
    return {
      loading: true,
      buttonLoading: false,
      total: 0,
      indent:{
        total: 0,
        good_code: []
      },
      isType: true,
      code_type: 0
    }
  },
  mounted() {
    this.getDetail()
  },
  methods: {
    async getDetail(){
      if(!$nuxt.$route.query.id){
        this.$message({
          message: '参数有误，请联系管理员',
          type: 'error'
        });
        $nuxt.$router.go(-1);
        return false
      }
      await Promise.all([
        detail($nuxt.$route.query.id)
      ]).then(([indentData]) => {
        this.indent = indentData;
        this.total = 0;
        let specification = null;
        this.indent.goods_list.forEach(item => {
          this.total += item.price * item.number;
          if(item.good_sku){
            this.code_type = item.good_sku.code_type
            specification = null;
            item.good_sku.product_sku.forEach(item2 => {
              if (specification) {
                specification += item2.value + ';';
              } else {
                specification = item2.value + ';';
              }
            });
            item.specification = specification.substr(0, specification.length - 1);
          }
          if (item.good.type === 2 || item.good.type === 3) {
            this.isType = false
          }
        });
        this.total = Number(this.total.toFixed(2));
        this.loading = false
      }).catch((error) => {
        this.loading = false
      })
    },
    // 确认收货
    confirmReceipt(){
      this.$confirm('是否确认收货？', '提示', {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.buttonLoading = true
        receipt(this.indent.id).then(response => {
          this.buttonLoading = false;
          this.$message({
            message: '操作成功',
            type: 'success'
          });
          this.getDetail();
        }).catch(() => {
          this.buttonLoading = false
        })
      }).catch(() => {
      })
    },
    goBack() {
      $nuxt.$router.go(-1)
    },
    doCopy (item) {
      this.$copyText(item).then(message => {
        this.$message({
          message: '复制成功',
          type: 'success'
        });
      }).catch(err => {
        console.log('失败')
      })
    },
    // 下载文件
    goDownload() {
      this.buttonLoading = true
      download(this.indent.id).then(response => {
        window.open(process.env.API_URL + 'indentDownload/'+ response)
      }).finally(() => {
        this.buttonLoading = false
      })
    }
  }
}
