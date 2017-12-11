## post /purchasePlan/submit
##### method: post
##### route: /purchasePlan/submit
##### params：
* 状态status
* 申请人applicant
* 采购明细数组details
    * 产品id product_id
    * 广州仓在途及库存数量 local_storage
    * FBA仓在途及库存总数 fba_storage
    * 7天平均销量 average_7
    * 30天平均销量 average_30
    * 预计销量 expected_sales
    * 国内运输和验货时间 local_transport
    * 国际运输和入仓时间 abroad_transport
    * 备货周期 prepare_period
    * 安全库存天数 safety_stock
    * 执行采购数量 purchase_amount
    * 供应商的id supplier
    * 单件采购成本 unit_cost
    * 预计生产时间 estimate_production_days
    * 最少起订量 least_amount
    * 预付比例 advance_pay_rate
    * 是否首次采购 first_time
    * 备注 remarks

##### return：null

## get /puchasePlan/showPurchasePlan
##### method: get
##### route: /purchasePlan/showPurchasePlan
##### params:
* 采购计划编号 plan_Id

##### return: 

```json
{
    "plan_Id":"采购计划编号",
    "status":"状态",
    "Logs":[
        {
            "applicant":"经手人",
            "status":"状态",
            "updatedAt":"记录时间",
            "remarks":"备注(可能为空)",
            "logsAmount":"库存SKU数"
        }
    ]
}


-------------------------------------------------------------
```json
{
    "status": "采购计划状态",
    "details": [
        {
            "product_id": "产品id",
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
        }
    ]
}