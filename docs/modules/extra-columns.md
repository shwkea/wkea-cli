# 附加列系统

## 1. 业务概念

**附加列** — 系统的动态扩展字段机制。每个模块可自定义任意字段，系统自动识别类型，无需预先定义数据库字段。

### 支持模块
| moduleCode | 模块 |
|-----------|------|
| vendor | 供应商 |
| spu | SPU |
| sku | SKU |
| customer | 客户 |
| demandInquiry | 需求询价 |
| demandInquiryItem | 需求询价行项目 |

---

## 2. 前置条件

- 模块已注册 ExtraColumn 支持（上述模块已内置支持）
- 扩展字段的 key 自动创建配置，无需预先定义

---

## 3. 使用场景

当用户提供的信息在系统现有字段中没有对应项时使用。常见场景：

| 场景 | 示例信息 | 操作 |
|------|---------|------|
| 供应商 | 法人、注册资本、品牌代理等级、开户许可证号 | `vendor create --extra-columns '{"{columnKey}":"{columnValue}"}'` |
| SPU | 产品认证、材质、原产地、安装方式 | `spu create --extra-columns '{"{columnKey}":"{columnValue}"}'` |
| SKU | 包装规格、海关编码、原厂编号 | `sku create --extra-columns '{"{columnKey}":"{columnValue}"}'` |
| 客户 | 税号、开票地址、收货偏好 | `customer create --extra-columns '{"{columnKey}":"{columnValue}"}'` |
| 需求询价 | 客户特殊要求、技术参数补充 | `demand create --extra-columns '{"{columnKey}":"{columnValue}"}'` |

> 具体参数名通过 `--help` 查看。

## 4. 参数格式

**简单格式**（自动创建 text 类型）：
```
--key {columnKey} --value {columnValue}
```

**扩展格式**（指定类型和属性）：
支持：type（text/number/date/select/boolean/email/phone/link）、title、options（下拉选项）、columnWidth、align 等

---

## 5. 使用原则

1. 不存在的 key 自动创建配置，无需提前定义
2. 扩展格式会更新已有配置（同名 key 类型冲突时覆盖）
3. 已存在的 key 只需配置一次，后续简单格式即可
4. 追加而非覆盖，不影响已有列
5. create / update 操作均可附带扩展字段
6. AI 使用 key-value 格式，内部自动解析 columnKey → columnId

---

## 6. 边界情况

- **columnKey 与 columnId**：底层存 columnId（数字），API 用 columnKey（字符串），系统自动转换
- **配置只创建一次**：已存在的 key 只需配置一次
- **删除配置不影响已有数据**：删除配置不会删除已存的值
