# Invincible ReadMe

## 前后端路由接口

### 用户管理

- 用户列表

  路由：/users

  方法：GET

  参数：无

  返回：

  ```json
  [
      {
        "_id":"用户id",
        "account":"用户名",
        "status":状态,
        "role":{
          "_id":"角色id",
          "name":"角色名",
          "type":"角色类型",
          "routes":[
            角色路由权限
          ]
        },
        "name":"用户姓名",
        "createdAt":"创建时间",
        "updatedAt":"更新时间",
        "team":小组id,
        "creator":{
          "id":"创建者id",
          "account":"创建者用户名",
          "name":"创建者姓名"
        }
      },
    {
        ...
    }
  ]
  ```

  ​

- 创建用户

  路由：/users

  方法：POST

  参数：

  | Key      | Description          |
  | -------- | -------------------- |
  | account  | 用户名（大小写字母、数字、下划线）    |
  | name     | 姓名                   |
  | password | 使用CryptoJS.MD5加密后的密码 |
  | role     | 角色的id                |
  | team     | 小组的id（可以为null）       |

  返回：

  ```json
  {
      
  }
  ```


- 编辑用户

  路由：/users/用户id

  方法：PUT

  参数：

  | Key      | Description          |
  | -------- | -------------------- |
  | account  | 用户名（用于验证）            |
  | name     | 姓名                   |
  | password | 使用CryptoJS.MD5加密后的密码 |
  | role     | 角色                   |
  | team     | 小组id                 |

  返回：

  ```json
  {
      
  }
  ```

  ​


### [purchase]采购管理

- 采购汇总表

  路由：/purchase/purList

  方法：GET

  参数：

  | Key            | Description |
  | -------------- | ----------- |
  | orderNumber    | 订单号         |
  | contractNumber | 合同号         |
  | supplierId     | 供应商Id       |
  | storeSku       | 库存SKU       |
  | proNameCn      | 商品中文名       |
  | orderStatus    | 订单基本状态      |

  返回：

  ```json
  [
    {
          "orderNumber":"订单号",
          "contractNumber":"合同号",
          "supplierName":"供应商名字",
          "purTotalPrice": 订单总金额,
          "orderStatus": "订单基本状态",
      "skuDetail": [
        {
          "storeSku": 库存sku,
          "nameCN"中文名:,
          "name":英文名
        }
      ]
      	"isDeclare": 是否报关,
    },
    {
        ...
    }
  ]
  ```


- 新增采购单

  路由：/purchase/purSave

  方法：POST

  参数：

  | Key            | Description             |
  | -------------- | ----------------------- |
  | orderNumber    | 订单号                     |
  | contractNumber | 合同号                     |
  | supplierId     | 供应商Id                   |
  | orderTime      | 下单时间                    |
  | buyer          | 采购员                     |
  | orderStatus    | 订单状态                    |
  | pickupWay      | 提货方式                    |
  | isDeclare      | 是否报关                    |
  | purDetails     | 采购单详情（Array[Json,Json]） |


purDetails：
| purDetailsKey | purDetailsDescription |
| ------------- | --------------------- |
| storeSku      | 库存SKU                 |
| unitPrice     | 单价                    |
| purQuantity   | 采购数量                  |
| totalPrice    | 总金额(含运费)              |
| conCovDate    | 合同约定交期                |
| delQuantity   | 交货数量                  |
| deliverDate   | 实际交期                  |
| logNumber     | 物流追踪单号                |
| remark        | 备注                    |
| salesman      | 业务员     Array[]       |
  返回：

  ```json
  Boolean
  ```


- 选择商品

  路由：/purchase/productList

  方法：GET

  参数：无

  返回：

  ```json
  [
    {
  	"storeSku":"编号",
  	"nameCN":"商品中文名"，
      "nameEN":"商品英文名"
    },
    {
      	...
    },
  ]
  ```


- 编辑采购单打开

  路由：/purchase/purchaseOne

  方法：GET

  参数：

  | Key         | Description |
  | ----------- | ----------- |
  | orderNumber | 订单号         |

  返回：

  ```json
  {
    {
    	"purchaseId":"订单id"
    	"orderNumber":"订单号",
  	"contractNumber":"合同号",
   	"supplier":{
        	  "supplierId":"供应商ID",
        	  "supplierName":"供应商名字"
      }
  	"orderTime":下单时间,
  	"buyer":"采购员",
  	"orderStatus": 订单状态,
  	"isDeclare": 是否报关,
  	"purDetails":[
    		{
  			"storeSkuId":"库存SKU ID",
  			"storeSku":"库存SKU",
    			"proNameCN":"商品中文名",
    			"proNameEN":"商品英文名",
    			"unitPrice":"单价",
    			"purQuantity":采购数量,
    			"totalPrice":"总金额(含运费)",
    			"conCovDate":合同约定交期,
    			"purQuantity":交货总数量，
    			"deliverDate":实际交期，
    			"salesman":[业务员],
    			"logNumber":"物流追踪单号"
    			"remarks": "备注"
  		},
  		{
    		    ...
    		}
  	],
  	"pickupWay":"提货方式",
  	"remarks":"详细备注"
    } 
  }
  ```




- 编辑采购单保存

  路由：/purchase/purUpdate

  方法：POST

  参数：

  | Key            | Description        |
  | -------------- | ------------------ |
  | purchaseId     | 订单ID               |
  | orderNumber    | 订单号                |
  | contractNumber | 合同号                |
  | supplierId     | 供应商ID              |
  | orderTime      | 下单时间               |
  | buyer          | 采购员                |
  | salesman       | 业务员                |
  | orderStatus    | 订单状态               |
  | pickupWay      | 提货方式               |
  | isDeclare      | 是否报关               |
  | purDetails     | 采购单详情  Array[Json] |

purDetails：
| purDetailsKey | purDetailsDescription |
| ------------- | --------------------- |
| storeSkuId    | 库存SKU ID              |
| storeSku      | 库存SKU                 |
| unitPrice     | 单价                    |
| purQuantity   | 采购数量                  |
| totalPrice    | 总金额(含运费)              |
| conCovDate    | 合同约定交期                |
| delQuantity   | 交货数量                  |
| deliverDate   | 实际交期                  |
| logNumber     | 物流追踪单号                |
| remark        | 备注                    |
| salesman      | 业务员         Array[]   |
  返回：

  ```json
  Boolean
  ```


- 订单详情

  路由：/purchase/detailList

  方法：GET

  参数：

  | Key         | Description |
  | ----------- | ----------- |
  | orderNumber | 订单号         |

  返回：

  ```json
  {
  	"orderNumber":"订单号",
  	"contractNumber":"合同号",
  	"supplierName":"供应商",
  	"orderTime":下单时间,
  	"buyer":"采购员",
  	"orderStatus": 订单状态,
    	"purTotalPrice": 订单总金额，
   	"isDeclare": 是否报关,
  	"purDetails":[
    		{
  				"storeSku":"库存SKU",
    				"proNameCN":"商品中文名",
    				"proNameEN":"商品英文名",
    				"unitPrice":"单价",
    				"purQuantity":采购数量,
    				"totalPrice":"总金额(含运费)",
    				"conCovDate":合同约定交期,
    				"deliverTotal":已交货数量,
    				"deliverDate":实际交期，
    				"salesman":[业务员],
    				"logNumber":"物流追踪单号"
    				"remarks": "备注"
  		},
  		{
    		    ...
    		}
  	],
  	"pickupWay":"提货方式",
  	"remarks":"详细备注"
  }
  ```



- 订单跟进打开
  路由：/purchase/statusList

  方法：GET

  参数：

  | Key         | Description |
  | ----------- | ----------- |
  | orderNumber | 订单号         |

  返回：

  ```json

    {
  	"orderStatus":"订单状态",
      "purDetails":[
        {
          		"deliverId":"库存SKU ID"
          		"storeSku":"库存SKU",
    				"proNameCN":"商品中文名",
    				"purQuantity":采购数量,
    				"deliverTotal":已交货数量,
    				"remarks": [备注]
        },
        {
    	      ...
    	  }
      ]
    },

  ```




- 订单跟进保存
  路由：/purchase/statusUpdate

  方法：POST

  参数：

  | Key         | Description               |
  | ----------- | ------------------------- |
  | orderNumber | 订单号                       |
  | orderStatus | 订单状态                      |
  | delivers    | 订单详情       Array[deliver] |


  deliver：
| deliverKey  | deliverDescription |
| ----------- | ------------------ |
| deliverId   | 库存SKU ID           |
| delQuantity | 交货数量               |
| deliverDate | 实际交期               |
| remark      | 备注                 |

  返回：

  ```json
  Boolean
  ```


- 添加备注打开

  路由：/purchase/findRemark

  方法：GET

  参数：

  | Key         | Description |
  | ----------- | ----------- |
  | orderNumber | 订单号         |

  返回：

  ```json
  [
    库存sku
  ]
  ```


- 添加备注保存

  路由：/purchase/addRemark

  方法：POST

  参数：

  | Key      | Description |
  | -------- | ----------- |
  | storeSku | 库存SKU       |
  | remark   | 订单状态        |

  返回：

  ```json

  ```


- 供应商列表
  路由：/supplier/supplierList
  方法：GET
  参数：无
  返回：
  ```json
  [
    		{
        	  "supplierId":"供应商ID",
        	  "supplierName":"供应商名字"，
            "contacts": 联系人,
    		  "telephone": 固定电话,
    		  "cellphone": 手机号码
        	},
          {
      	    ...
      	}
  ]

  ```


- 供应商添加
  路由：/supplier/supplierSave
  方法：POST
  参数：
  | Key       | Description |
  | --------- | ----------- |
  | name      | 供应商名字       |
  | contacts  | 联系人         |
  | telephone | 固定电话        |
  | cellphone | 手机号码        |
  返回：
  ```json
  Boolean
  ```


- 供应商编辑打开

  路由：/supplier/supplierOne

  方法：GET

  参数：

  | Key        | Description |
  | ---------- | ----------- |
  | supplierId | 供应商Id       |

  返回：

  ```json
  {
    "supplierId": 供应商Id,
    "supplierName": 供应商名字,
    "contacts": 联系人,
    "telephone": 固定电话,
    "cellphone": 手机号码
  }
  ```



- 供应商编辑

  路由：/supplier/supplierUpdate

  方法：POST

  参数：

  | Key        | Description |
  | ---------- | ----------- |
  | supplierId | 供应商Id       |
  | contacts   | 联系人         |
  | telephone  | 固定电话        |
  | cellphone  | 手机号码        |

  返回：

  ```json
  Boolean
  ```



- 采购统计单

  路由：/purchasePlan/purTotal

  方法：GET

  参数：

  | Key      | Description |
  | -------- | ----------- |
  | storeSku | 库存SKU       |
  | nameCN   | 商品中文名       |
  | supplier | 供应商         |
  | buyer    | 采购员         |

  返回：

  ```json
  {
    "buyer":采购员,
    "supplierName":供应商名字,
    "proNameCN":SKU中文名,
    "proStoreSku":库存SKU,
    "salesVolume":日销售量,
    "totalVolume":总销量,
    "orderProduct":订单库存（生产中）,
    "orderTransit":订单库存（到仓库途中）,
    "stock":仓库库存,
    "receiptStock":中国仓—FBA仓库,
    "FBAStore":FBA库存,
    "":当天退货个数,
    "":上架→目前退货统计,
    "":退货率
  }
  ```


- 创建/保存采购计划

  路由：/purchasePlan/submit

  方法：POST

  参数：

  | Key       | Data Type | Description |
  | --------- | --------- | ----------- |
  | status    | String    | 状态          |
  | applicant | String    | 申请人         |
  | details   | Array     | 采购明细数组      |

details
| Key                      | Data Type | Description |
| ------------------------ | --------- | ----------- |
| product_id               | String    | 产品id        |
| local_storage            | String    | 广州仓在途及库存数量  |
| fba_storage              | String    | FBA仓在途及库存总数 |
| average_7                | String    | 7天平均销量      |
| average_30               | String    | 30天平均销量     |
| expected_sales           | String    | 预计销量        |
| local_transport          | String    | 国内运输和验货时间   |
| abroad_transport         | String    | 国际运输和入仓时间   |
| prepare_period           | String    | 备货周期        |
| safety_stock             | String    | 安全库存天数      |
| purchase_amount          | String    | 执行采购数量      |
| supplier                 | String    | 供应商的id      |
| unit_cost                | String    | 单件采购成本      |
| estimate_production_days | String    | 预计生产时间      |
| least_amount             | String    | 最少起订量       |
| advance_pay_rate         | String    | 预付比例        |
| first_time               | String    | 是否首次采购      |
| remarks                  | String    | 备注          |

  返回：

  ```json
  无
  ```

- 采购计划首页展示

  路由：/purchasePlan/show

  方法：GET

  参数：

  | Key         | Data Type | Description |
  | ----------- | --------- | ----------- |
  | plan_id     | String    | 采购计划编号      |
  | applicant   | String    | 申请人         |
  | stratTime   | String    | 申请开始时间      |
  | endTime     | String    | 申请结束时间      |
  | operator    | String    | 运营部审核人      |
  | supplyChain | String    | 供应链审核人      |

  返回：

```json
{
  "datas":"主要数据"
  [
    {
        "plan_Id":"采购计划编号",
        "status":"状态",
        "peoples":{
          "applicant":"申请人",
          "operator":"运营部审核",
          "suppliyChain":"供应链审核"
        },
        "details":[
          {
            "productSku":"商品库存sku",
            "productName":"中文名"
          },
          {...}
        ],
    },
    {...}
  ],
  "pageCount":"页数"
}

```



- 采购计划编辑

  路由：/purchasePlan/editShow

  方法：GET

  参数：

  | Key     | Data Type | Description |
  | ------- | --------- | ----------- |
  | plan_id | String    | 采购计划编号      |


返回：

```json
{
    "status": "采购计划状态",
    "applicantName": "申请人",
    "details": [
        {
            "_id":"_id",
            "productSku": "产品Sku",
            "productName": "产品名字",
            "product_id": "产品ID",
            "local_storage": "广州仓在途及库存数量",
            "fba_storage": "FBA仓在途及库存总数",
            "average_7": "7天平均销量",
            "average_30": "30天平均销量",
            "expected_sales": "预计销量",
            "local_transport": "国内运输和验货时间",
            "abroad_transport": "国际运输和入仓时间",
            "prepare_period": "备货周期",
            "safety_stock": "安全库存天数",
            "purchase_amount": "执行采购数量",
            "supplier": "供应商的id",
            "unit_cost": "单件采购成本",
            "estimate_production_days": "预计生产时间",
            "least_amount": "最少起订量",
            "advance_pay_rate": "预付比例",
            "first_time": "是否首次采购",
            "remarks": "备注",
        },
        {...}
    ],
    //审核结果
    "reviews":
    [
      {
        "status":"审核结果(同意或不同意)", //0为不同意，1为同意
        "operator":"运营的审核意见（存在则是运营意见，不存在则为空）",
        "supplyChain":"供应链的审核意见（存在就是供应链意见，不存在则为空）"
      },
      {...}
    ]
    
}
```


- 采购计划编辑

  路由：/purchasePlan/editSubmit

  方法：POST

  参数：

  | Key       | Data Type | Description |
  | --------- | --------- | ----------- |
  | status    | String    | 状态          |
  | applicant | String    | 申请人         |
  | plan_id   | String    | 采购计划编号      |
  | details   | Array     | 采购明细数组      |

details
| Key                      | Data Type | Description |
| ------------------------ | --------- | ----------- |
| product_id               | String    | 产品id        |
| local_storage            | String    | 广州仓在途及库存数量  |
| fba_storage              | String    | FBA仓在途及库存总数 |
| average_7                | String    | 7天平均销量      |
| average_30               | String    | 30天平均销量     |
| expected_sales           | String    | 预计销量        |
| local_transport          | String    | 国内运输和验货时间   |
| abroad_transport         | String    | 国际运输和入仓时间   |
| prepare_period           | String    | 备货周期        |
| safety_stock             | String    | 安全库存天数      |
| purchase_amount          | String    | 执行采购数量      |
| supplier                 | String    | 供应商的id      |
| unit_cost                | String    | 单件M采购成本     |
| estimate_production_days | String    | 预计生产时间      |
| least_amount             | String    | 最少起订量       |
| advance_pay_rate         | String    | 预付比例        |
| first_time               | String    | 是否首次采购      |
| remarks                  | String    | 备注          |


返回：

```json
无
```



- 采购计划审核

路由：/purchasePlan/review

方法：POST

参数：

| Key    | Data Type | Description |
| ------ | --------- | ----------- |
| status | String    | 状态          |
| review | object    | 审核数据        |

```json
review{
  "status":"同意或不同意（1或0）",
  "remark":"审核意见"
}
```

返回：

```json
true
```



### [daily]每日运营

- 缺货损失

  路由：/daily/PopupList

  方法：GET

  参数：

  | Key    | Description |
  | ------ | ----------- |
  | time   | 搜索时间        |
  | teamID | 小组ID        |

  返回：

 ```json
 [
   {
     "asin":ASIN,
   	"sellerSku":MSKU,
   	"sellableStock":期间最新可售库存,
   	"receiptingStock":期间最新待收货库存,
   	"transportStock":期间最新转库中库存,
   	"name":商品名称,
   	"storeSku":库存SKU,
   	"teamName":小组名,
   	"projectedSales":预计日销量,
   	"state":状态,
   	"averageLoss":缺货损失额,
   	"lossVolume":近3日平均销量,
   	"shopName":店铺名,
   	"unitPrice":期间最新单价
   },
   {
       ...
   }
 ]
 ```


- 每日信息

  路由：/daily/list

  方法：GET

  参数：

  | Key       | Description |
  | --------- | ----------- |
  | timeRange | 搜索时间段       |

  返回：

  ```json
  [
    {
      "asin":ASIN,
      "name":商品名称,
      "projectedSales":预计日销量,
      "receiptingStock":期间最新待收货库存,
      "salesPrice":期间累计净销售额,
      "salesVolume":期间累计销量,
      "sellableStock":期间最新可售库存,
      "sellerSku":MSKU,
    	"shop":{name: 店铺名, id: 店铺id},
      "state":状态,
      "storeSku":库存SKU,
    	"teamName":小组名,
    	"transportStock":期间最新转库中库存,
    	"unitPrice":期间最新单价
      "shelfTime":上架时间
    },
    {
        ...
    }
  ]
  ```

- 每日报表

  路由：/daily/show

  方法：GET

  参数：

  | Key  | Description |
  | ---- | ----------- |
  | time | 搜索时间        |

  返回：

  ```json
  {
    barData:[
      {
      "date":"时间"
  	  "monthAllSales":"销量提示"
  	  "y":"y轴"
      },
      {
        ...
      }
    ],
    "date":"搜索时间",
    lineDateCount:{
      "小组名": "[60天前到月底的销量] "
      ...
    }
    lineDatePrice:{
    	"小组名":"[60天前到月底的销售额]" 
      ...
    }
    "nowMonthStart":"小组名在月头数据的下标"
    "result":{
    "averageCount":"30天日均销量"
  	"averageSales":"30天日均销售额"
  	"dailyCount":"当日销量"
  	"dailySales":"当日销售额"
  	"monthCount":"本月销量"
  	"monthSales":"本月销售额"
  	"relativelyYesMultiplicationCount":"销售量比上日+/-"
  	"relativelyYesMultiplicationPrice":"销售额比上日+/-"
  	"relativelyYesPercentCount":"销售量比上日%"
  	"relativelyYesPercentPrice":"销售额比上日%"
  	"stockLoss":"缺货损失"
  	"team"：{
      	"teamName":"小组"
      	"teamId":"小组ID"
      }
    }
  }
  ```








### [me] 用户自身管理

- 修改密码

  路由：/me/password

  方法：PUT

  参数：

  | Key      | Data Type | Description          |
  | -------- | --------- | -------------------- |
  | password | String    | 使用CryptoJS.MD5加密后的密码 |

  返回：

  ```json
  {
    
  }
  ```

  ​

### [teams] 小组管理

- 小组列表

  路由：/teams

  方法：GET

  参数：无

  返回：

  ```json
  [
    {
      _id: "小组id",
      name: "小组名",
      leader: {
        _id: "组长的用户id",
        account: "组长的用户名",
        name: "组长的姓名"
      },
      members: [
      	{_id: "组员的用户id", account: "组员的用户名", name: "组员的姓名"},
        {...}
      ],
      createdAt: "创建时间",
      updatedAt: "更新时间"
    },
    {...}
  ]
  ```

  ​


- 注册小组

  路由：/teams

  方法：POST

  参数：

  | Key  | Data Type | Description |
  | ---- | --------- | ----------- |
  | name | String    | 小组名（可任意字符）  |
  |      |           |             |
  |      |           |             |

  返回：

  ```json
  {
    
  }
  ```

  ​

### [roles]角色管理

- 角色列表：

  路由：/roles

  方法：GET

  参数：无

  返回：

  ```json
  [
  	{
        "_id":"角色ID",
        "name":"角色名",
        "type":"角色类型",
        "createdAt":"创建时间",
        "updatedAt":"更新时间",
        "history":[历史记录],
        "routes":[路由权限列表],
        "management":[下属角色id列表]
      },
  	{...}
  ]
  ```



- 创建角色：

  路由：/roles

  方法：POST

  参数：

  | Key        | Data Type | Description            |
  | ---------- | --------- | ---------------------- |
  | type       | String    | 角色类型，可以先在角色列表中初步筛选不能重复 |
  | name       | String    | 角色名                    |
  | routes     | Array     | 路由列表，可以为空              |
  | department | String    | 部门名字                   |
  | management | Array     | 下属角色id列表               |

  返回：

  ```json
  {
    "_id":"角色ID",
    "name":"角色名",
    "type":"角色类型",
    "createdAt":"创建时间",
    "updatedAt":"更新时间",
    "history":[历史记录],
    "routes":[路由权限列表],
    "management":[下属角色id列表]
  }
  ```



- 部门列表：

  路由：/roles/department

  方法：GET

  参数：无

  返回：

  ```json
  [
    "部门1",
    "..."
  ]
  ```

  ​
### [appraise]评论统计

- 角色列表：

  路由：/appraise/EVALTotal

  方法：GET

  参数：无

  返回：

  ```json
  [
    {
      "inTime":"数据时间"
  	"asin":"ASIN"
  	"imgUrl":"图片"
  	"title":"标题"
  	"price":"售价
  	"side":"站点"
  	"totalStar":评价星级
  	"reviewsCnt":评价数量
  	"vpCnt":VP数量
  	"vpProportion":"VP占比"
  	"nvpCnt":直评数量
  	"nvpProportion":"直评占比"
  	"reviewFirstTime":"第一次评价"
  	"reviewLastTime":"最近一次评价"
    },
    {...}
  ]
  ```



- 查看详情：

  路由：/appraise/EVALDetail

  方法：GET

  参数：

  | Key              | Data Type | Description |
  | ---------------- | --------- | ----------- |
  | asin             | String    | ASIN        |
  | side             | String    | 站点          |
  | verifiedPurchase | String    | 购买状态        |
  | startDate        | String    | 开始日期        |
  | endDate          | String    | 结束日期        |

  返回：

  ```json
  {
    "details": [
    	{
    	  "dataTime":"数据日期",
  		"reviewTime":"评价时间",
  		"asin":"asin",
  		"side":"站点",
  		"star":评价星级,
  		"authorId":"评价人ID",
  		"author":"评价人",
  		"verifiedPurchase":"是否VP",
  		"hasImg":"是否有图",
  		"hasVideo":"是否有视频",
  		"content":"评论内容",
  		"voteNum":点赞数
    	},
    	{...}
    ]
       "lineReview": {
       	"lineTime":["评论时间"(2017-10-10)],
       	"isPv":[有购买(4)],
       	"isNotPv":[非购买(2)]
      },
      "starDivide":{
      	five:"5星",
      	four:"4星",
      	three:"3星",
      	two:"2星",
      	one:"1星",
      }
  }
  ```



- 评论任务：

  路由：/appraise/EVALTask

  方法：POST

  参数：

  | Key  | Data Type | Description     |
  | ---- | --------- | --------------- |
  | asin | String    | ASIN            |
  | side | String    | 站点（SI_US，SI_**） |

  返回：

  ```json
  无
  ```


  

- 关键词：

  路由：/appraise/keyword

  方法：GET

  参数：

  | Key          | Data Type | Description |
  | ------------ | --------- | ----------- |
  | bprice       | String    | 最小价格        |
  | eprice       | String    | 最大价格        |
  | breview      | String    | 最小评论数       |
  | ereview      | String    | 最大评论数       |
  | bscore       | String    | 最小打分        |
  | escore       | String    | 最大打分        |
  | keyword      | String    | 关键字         |
  | currentPage  | Number    | 当前页数        |
  | itemsPerPage | Number    | 页面数据量       |
  | brate        | String    | 最小大类排名      |
  | erate        | String    | 最大大类排名      |


  返回：

  ```json
  {
  	"dataList   ": {
  	  "price":价格
  	  "csrReview"："用户评论数"
  	  "title:"标题"
  	  "smallType":"小类名"
  	  "score":"打分"
  	  "isZiYingv":"是否自营"
  	  "isFba":"是否FBA"
  	  "bigTypeRank":"大类排名"
  	  "bigType":"大类名"
  	  "url":"asin地址"
  	  "asin":"asin"
  	  "currency":"价格符号"
  	}
  	keywords:["关键字"]，     
    	totalItems:总数据量
  }
  ```

- 关键词任务：

  路由：/appraise/EVALTask

  方法：POST

  参数：

  | Key     | Data Type | Description     |
  | ------- | --------- | --------------- |
  | keyword | String    | 关键词             |
  | site    | String    | 站点（SI_US，SI_**） |

  返回：

  ```json
  无
  ```


### [profit]毛利率统计报表

- sku详情：

  路由：/profit/profitDetail

  方法：POST

  参数：

  | Key      | Data Type | Description |
  | -------- | --------- | ----------- |
  | shopName | String    | 店铺名         |
  | teamName | String    | 小组名         |
  | storeSku | String    | sku         |

  返回：

  ```json
  {
    "asin":"asin",
    "nameCN":"商品中文名",
    "storeSku":"库存sku"
  }
  ```

### [base]基础信息管理

- 商品管理：

  路由：/base/list

  方法：GET

  参数：无

  返回：

  ```json
  {
    list:[
      {
    	  "id":"id",
    	  "sellerSku":"卖家sku",
    	  "productId":"产品id",
    	  "FBA":是否fba,
    	  "fnsku":"fnsku",
    	  "asin":"asin",
    	  "nameCN":"中文名",
    	  "shop":{
    	  "name":"店铺名",
    	  "shopId":"店铺ID"
    	},
    	  "teamName":"小组名",
    		"state":"状态",
    		"projectedSales":"预计日销量",
    		"price":"标准价格",
      	"shelfTime":"上架时间"
    	},
      {···}
      ],
    	stockList:[
        {
          _id: "id",
         store_sku: "库存sku",
         name_cn: "中文名"
        },
        {···}
      ],
    shopsNames:[
      {
        _id: "id", 
        name: "店铺名"
      }
    ]
  }
  ```


- 商品添加：

  路由：/base/saveMerchandise

  方法：POST

  参数：

  | Key            | Data Type | Description |
  | -------------- | --------- | ----------- |
  | asin           | String    | ASIN        |
  | projectedSales | Number    | 预计日销量       |
  | productId      | String    | 库存SKU       |
  | sellerSku      | String    | 卖家sku       |
  | shelfTime      | Date      | 上架时间        |
  | shopId         | String    | 所属店铺        |
  | teamId         | String    | 所属小组        |
  | state          | Number    | 商品销售状态      |
  | price          | Number    | 标准价格        |
  | FBA            | Number    | FBA         |
  | fnsku          | String    | FNSKU       |

  返回：

  ```json
  Boolean
  ```


- 商品编辑：

  路由：/base/update

  方法：POST

  参数：

  | Key            | Data Type | Description |
  | -------------- | --------- | ----------- |
  | asin           | String    | ASIN        |
  | projectedSales | Number    | 预计日销量       |
  | productId      | String    | 库存SKU       |
  | sellerSku      | String    | 卖家sku       |
  | shelfTime      | Date      | 上架时间        |
  | shopId         | String    | 所属店铺        |
  | teamId         | String    | 所属小组        |
  | state          | Number    | 商品销售状态      |
  | price          | Number    | 标准价格        |

  返回：

  ```json
  Boolean
  ```


- 商品删除：

  路由：/base/deleteMerd

  方法：POST

  参数：

  | Key       | Data Type | Description |
  | --------- | --------- | ----------- |
  | asin      | String    | ASIN        |
  | shopID    | String    | 所属店铺        |
  | sellerSku | String    | 卖家sku       |

  返回：

  ```json
  Boolean
  ```


### [workOrder]客服工单

- 客服列表：

  路由：/workOrder/customerList

  方法：GET

  参数：无

  返回：

  ```json
  {
    customerList:[
      {
    	  WOCustomerID:"工单客服ID",
    	  operateTeam:"运营小组",
    	  WOType:"工单类型",
        customer:{
          customerID:"客服ID"
          customerName:"客服名字"
        }
    	},
      {···}
    ]
  }
  ```


- 编辑客服：

  路由：/workOrder/updateCustomer

  方法：POST

  参数：

  | Key          | Data Type | Description |
  | ------------ | --------- | ----------- |
  | WOCustomerID | String    | 工单客服ID      |
  | operateTeam  | String    | 运营小组        |
  | WOType       | String    | 工单类型        |
  | customer     | String    | 客服ID        |

  返回：

  ```json
  Boolean
  ```


- 添加客服：

  路由：/workOrder/saveCustomer

  方法：POST

  参数：

  | Key         | Data Type | Description |
  | ----------- | --------- | ----------- |
  | operateTeam | String    | 运营小组        |
  | WOType      | String    | 工单类型        |
  | customer    | String    | 客服ID        |

  返回：

  ```json
  Boolean
  ```


- 删除客服：

  路由：/workOrder/deleteCustomer

  方法：POST

  参数：

  | Key          | Data Type | Description |
  | ------------ | --------- | ----------- |
  | WOCustomerID | String    | 工单客服ID      |

  返回：

  ```json
  Boolean
  ```

### 