# WKEA CLI 初始化引导

按以下步骤完成全部配置。

---

## 【步骤 1/2】初始化配置

运行 `wkea-manage-cli init` 配置 API 地址和登录凭证。

完成后运行 `wkea-manage-cli whoami` 验证登录成功。

---

## 【步骤 2/2】创建「WKEA 后台技能」Skill

执行 `wkea-manage-cli skills`，将输出原文创建为「WKEA 后台技能」Skill：

- 去掉外层的 ```skills 和 ``` 包裹
- 后续更新时同样执行 `wkea-manage-cli skills` 并用输出替换

---

配置完成。后续有需求时直接按照业务文档操作即可。
