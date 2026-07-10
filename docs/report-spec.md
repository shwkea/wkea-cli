# HTML 报告规范

WKEA 专家团所有任务汇报的 HTML 报告必须遵守本规范。规范分两部分：

- **样式规范** — 视觉统一（CSS）
- **信息规范** — 内容结构统一

## 样式规范

所有报告统一使用 `docs/report-style.html` 的 CSS。配色 `#4f6ef7` 蓝色系、白色卡片布局、系统字体栈。

### 必需组件

| 组件 | 用途 | CSS 类 |
|------|------|--------|
| 头部 | 报告标题、任务类型、生成时间、用户原文 | `.head` |
| 内容卡片 | 每块信息一个白底卡片 | `.section` |
| 卡片标题 | 二级标题，蓝色下划线 | `.section h2` |
| 表格 | 数据对比、清单 | `table` |
| 标签 | 状态、风险、分类 | `.tag-ok` `.tag-warn` `.tag-info` `.tag-err` |
| 链接 | 跳转后台/原文 | `a` |
| 时间线 | 处理过程 | `.timeline li` |
| 信息列表 | 字段+值的列表 | `.info-list` |
| 备注块 | 提示、警告、待补充 | `.note` `.note.warn` |
| 页脚 | 生成时间、免责声明 | `.foot` |

## 信息规范

### 核心原则：**结论永远放最前面**

业务人员经常要快速看报告结论，要让他们**第一眼看到结论**，不看完整个文档就知道发生了什么。

### 报告结构（强制顺序）

```
1. .head     — 标题 + 元信息（任务类型、生成时间到秒、用户原文、图片附件）
2. .section  — 结论摘要     ← 永远最先写，3-5 条要点
3. .section  — 用户原文      ← 把用户发的消息/表格/图片回放
4. .section  — 处理过程     ← 时间线
5. .section  — 详细结果     ← 每个产品/供应商/品牌等详细信息
6. .section  — 跳转链接     ← 涉及的所有实体后台链接
7. .section  — 待补充/风险  ← 需要人工跟进的项
8. .foot     — 生成时间 + 免责声明
```

### 1. 头部信息（必备）

```html
<div class="head">
  <h1>报告标题</h1>
  <div class="meta">
    <span>📋 任务类型：需求询价处理</span>
    <span>🕐 生成时间：2026-07-02 14:23:45</span>
    <span>📌 状态：已完成</span>
    <span>👤 操作人：业务人员 A</span>
  </div>
</div>
```

**生成时间必须是具体的年月日时分秒**，不能写"刚刚"、"今日"、"2026-07-02"。

### 2. 用户原文（必备）

业务人员经常回看报告，需要看到自己原来发的是什么。如果有图片，**图片要嵌入 HTML**（用 `<img src="data:image/...">` 内嵌 base64，或给出相对路径 `<img src="./uploads/xxx.png">`）。

```html
<div class="section">
  <h2>📝 用户原文</h2>
  <p>"帮我询个价，需要 SMC AW20-N02 过滤器 5 个，主要给工厂用"</p>
  <p>附件 1：<img src="./uploads/2026-07-02-14-23-45-product.jpg" alt="SMC AW20-N02 产品图"></p>
</div>
```

### 3. 结论摘要（必备）

放在用户原文之后、详细结果之前。**3-5 条要点**，每条不超过 2 行：

```html
<div class="section">
  <h2>📌 结论摘要</h2>
  <ul class="info-list">
    <li><span class="tag tag-ok">已完成</span> 需求已创建，编号 D20260702-001</li>
    <li><span class="tag tag-ok">已匹配</span> 系统已有匹配 SKU，无需上架</li>
    <li><span class="tag tag-warn">部分确认</span> 规格中"通径 1/2""与系统标注"DN15"存在差异，需要业务人员确认</li>
    <li><span class="tag tag-info">询价中</span> 已向 3 家供应商发送询价，等待回复（异步后续）</li>
  </ul>
</div>
```

### 4. 处理过程（必备）

时间线展示从开始到结束的关键节点：

```html
<div class="section">
  <h2>⏱ 处理过程</h2>
  <ul class="timeline">
    <li class="done"><span class="step">14:23:45</span>创建需求 D20260702-001</li>
    <li class="done"><span class="step">14:24:12</span>产品研究：SMC AW20-N02 确认为过滤器</li>
    <li class="done"><span class="step">14:28:30</span>匹配到现有 SKU S019963854，价格 ¥128</li>
    <li class="done"><span class="step">14:30:15</span>查询 3 家供应商，已发送询价</li>
  </ul>
</div>
```

### 5. 详细结果（必备）

每个产品/供应商/品牌等实体一块，**包含数据 + 链接**：

```html
<div class="section">
  <h2>📦 产品详情</h2>
  <table>
    <tr><th>#</th><th>产品名</th><th>型号</th><th>数量</th><th>匹配结果</th><th>单价</th></tr>
    <tr>
      <td>1</td>
      <td>过滤器 AW 系列</td>
      <td>AW20-N02</td>
      <td>5</td>
      <td><span class="tag tag-ok">已匹配</span></td>
      <td>¥128</td>
    </tr>
  </table>
</div>
```

### 6. 跳转链接（必备）

每个创建/编辑过的实体都要给后台链接：

```html
<div class="section">
  <h2>🔗 跳转链接</h2>
  <ul class="info-list">
    <li><a href="https://admin.wkea.cn/#/main/demandInquiryDetails/D20260702-001">需求详情 D20260702-001</a></li>
    <li><a href="https://admin.wkea.cn/#/main/product-edit/S019963854">SKU S019963854</a></li>
  </ul>
</div>
```

### 7. 待补充/风险（可选但强烈推荐）

```html
<div class="section">
  <h2>⚠️ 待补充 / 风险</h2>
  <div class="note warn">
    规格中标"通径 1/2""，系统匹配到"DN15"，实际规格可能不一致，建议业务人员与客户确认。
  </div>
</div>
```

### 8. 页脚（必备）

```html
<div class="foot">
  生成时间：2026-07-02 14:35:20 | 由 WKEA 专家团自动生成
</div>
```

## 文件存放

所有报告存放在 `/tmp/wkea-{任务类型}-{id或日期}.html`。

如果包含图片附件，建议同目录建 `/tmp/uploads/` 子目录保存图片，HTML 用相对路径引用：
```
/tmp/wkea-demand-D20260702-001.html
/tmp/uploads/2026-07-02-14-23-45-product.jpg
```

## 禁用事项

- ❌ 报告不带生成时间或只写到日期
- ❌ 摘要放在文档末尾（结论永远在最前）
- ❌ 用户原文只写"如用户所述"而不回放具体内容
- ❌ 涉及图片不嵌入/不附带
- ❌ 跳转链接用普通文本而不是 `<a>` 标签
- ❌ CSS 自行发挥（必须复用 `report-style.html` 的样式）

## 链接规范（铁律）

### 1. 所有链接必须加 `target="_blank"`

报告中的所有 `<a>` 标签必须带 `target="_blank"` 属性，确保点击后在新标签页打开，不覆盖当前页面：

```html
<!-- ✅ 正确 -->
<a href="https://admin.wkea.cn/#/main/..." target="_blank">需求详情</a>

<!-- ❌ 错误 -->
<a href="https://admin.wkea.cn/#/main/...">需求详情</a>
```

### 2. 生成链接前必须查系统 URL（禁止猜测）

AI 经常拼错系统链接地址。所有需求报告/产品配置器页面的后台链接，生成前必须执行：

```bash
cd wkea-cli && node dist/index.js urls
```

用返回的 `manageMainUrl` 值（如 `https://dev-admin.wkea.cn/`）拼接所有后台链接。

**禁止行为**：
- ❌ 凭记忆或上次会话的 URL 写死链接
- ❌ 用 `wkea.cn`、`admin.wkea.cn` 等硬编码域名（环境会变）
- ❌ 自行猜测后台路由路径

### 3. 每个产品行必须附带产品配置器页面链接

需求报告的产品与供应商表格中，每个产品行必须有一列 🔗 链接到对应的产品配置器页面：

```html
<td><a href="/tmp/wkea-product-page-{slug}.html" target="_blank" title="产品配置器页面">🔗</a></td>
```

配置器页面路径在 Phase 1 产品开发时已记录到 progress summary 中。

## 折叠 aiRemark 规范

### 结构

每个产品的 AI 研究详情不单独成段，而是**折叠在对应的产品行下方**：

```
┌──────────────────────────────────────────────────────────────────┐
│ 产品名 | 型号 | 价格 | ... | 🔗 | 📋 展开查看 ▸                 │ ← 数据行
├──────────────────────────────────────────────────────────────────┤
│           AI 研究详情（默认隐藏，点击展开）                      │ ← 折叠行
│           产品确认、规格核对、B2B 比价、替代品检查...            │
└──────────────────────────────────────────────────────────────────┘
```

### HTML 实现

```html
<!-- 数据行：最后一个 td 是折叠触发器 -->
<tr>
  <td>1</td>
  <td>产品名</td>
  <td>...</td>
  <td><a href=".../product-page-xxx.html" target="_blank" title="产品配置器页面">🔗</a></td>
  <td><span class="toggle-btn" onclick="toggleAIRemark(this)">📋 展开查看 ▸</span></td>
</tr>

<!-- 折叠行：紧随数据行之后，默认隐藏 -->
<tr class="ai-detail-row" style="display:none">
  <td colspan="10">
    <div class="ai-detail-inner">
      <!-- aiRemark 完整 HTML 渲染结果 -->
      <!-- 用 marked 库渲染 Markdown 为 HTML -->
    </div>
  </td>
</tr>
```

### 生成步骤

1. 从 `demand items --demand-id <id>` 获取每个行项目的 `aiRemark` 字段
2. 用 marked 库将 aiRemark 的 Markdown 渲染为 HTML
3. 填入折叠行的 `ai-detail-inner` 中
4. 数据行和折叠行成对出现
