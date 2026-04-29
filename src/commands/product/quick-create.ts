import { Command } from 'commander';
import { getApiUrl } from '../../config';
import { ApiClient } from '../../api/client';
import { quickCreate, QuickCreateDto } from '../../api/product/spu';
import { success, error, info } from '../../utils/printer';

export function quickCreateCommand(product: Command) {
  product
    .command('quick-create')
    .description('快速创建产品（SPU+规格+SKU 一次性完成；SKU 可选）')
    .requiredOption('--spu-name <name>', 'SPU 名称')
    .option('--spu-id <id>', '已有 SPU ID（传此则复用 SPU，只创建 SKU）')
    // 品牌/分类/供应商
    .option('--brand-id <id>', '品牌 ID')
    .option('--brand-name <name>', '品牌名称（优先用 --brand-id）')
    .option('--brand-ids <ids>', '品牌 ID 列表，逗号分隔')
    .option('--category-id <id>', '分类 ID')
    .option('--category-name <name>', '分类名称（优先用 --category-id）')
    .option('--vendor-id <id>', '供应商 ID')
    .option('--vendor-name <name>', '供应商名称（优先用 --vendor-id）')
    // SPU 基础字段
    .option('--series <series>', '系列')
    .option('--tag <tag>', '产品标签（生成型号用）')
    .option('--manager-id <id>', '经理ID')
    .option('--description <text>', 'SPU 描述')
    .option('--category-show <show>', '产品分类展示')
    .option('--can-be-returned', '是否可退货')
    .option('--buy-spec', '是否按规格购买')
    .option('--stop-production <status>', '停产后替代系列')
    // 文档/图片
    .option('--images <urls>', '图片 URL（多张逗号分隔）')
    .option('--pdf-link <url>', 'PDF 链接')
    .option('--details <text>', '详情介绍（富文本）')
    .option('--model-remark <remark>', '产品选型备注')
    // 其他
    .option('--sales-deliver <num>', '销售交期')
    .option('--es-keyword <keyword>', 'ES 搜索关键词')
    // 规格（SPU 级）
    .option('--specs <json>', '规格列表 JSON，自动检测格式：JSON 对象（简单规格，格式: {"颜色":["红色","蓝色"]}）或 JSON 数组（完整规格含 tag/sort/isFixed，格式: [{"name":"主体尺寸","sort":1,"params":[{"name":"20","tag":"20","sort":1}]}]）')
    // -s 是手动从 argv 累积，option 只做声明用途（值被忽略）
    .option('-s, --sku <json>', 'SKU JSON（可多次传入），字段说明：\n  name(string,必填)=SKU名称  model(string)=型号\n  specs(object)=自动创建规格，格式: {"规格名":["值1","值2"]}\n  attributes(array)=属性列表，格式: [{"name":"属性名","value":"属性值"}]\n  paramIds(array)=已有规格参数ID（直接复用，不自动创建）\n  salesPrice(number)=售价  purchasePrice(number)=采购价  stock(number)=库存\n  weight(number)=重量(kg)  unit(number)=单位ID  isShelf(boolean)=是否上架\n  remark(string)=备注\n  -- 扩展字段 --\n  images(string)=图片集合(逗号分隔)  imgReference(boolean)=详情图仅供参考\n  salesDeliver(number)=销售交期  deliveryDateType(number)=交期类型\n  safetyStock(number)=库存下限  ceilingStock(number)=库存上限\n  actualSalesPrice(number)=实际售价  taxRate(number)=销售税率\n  purchaseTaxRate(number)=采购税率  purchaseLink(string)=采购链接\n  tagManage(number)=SKU标签  templateId(number)=运费模板Id\n  barcode(string)=条码  esKeyword(string)=ES搜索关键词\n  life(number)=质保期(天)  returnDeadline(number)=退货期限(天)\n  invoiceMethod(number)=开票方式  purchaseState(boolean)=采购状态\n  replaceSku(string)=替换SKU  dineInDetails(string)=堂食详情\n  specName(string)=规格值名称  extendId(string)=扩展ID\n  offlineCategory(number)=线下分类  unitAmounts(string)=单位量\n  itemNumber(string)=货号  positionRemark(string)=位置备注\n  simpleDesc(string)=简单描述\n  -- 详细信息(info对象) --\n  info.vendorsSku(string)=供应商SKU\n  info.manufacturerModel(string)=制造商型号\n  info.minOrderQuantity(number)=最小起订量\n  info.minOrderMultiple(number)=最小起订倍数\n  info.minPurchaseQuantity(number)=最小采购量\n  info.minPurchaseMultiple(number)=最小采购倍数\n  info.innerPackingQuantity(number)=内包装数量\n  info.startDate(string)=销售开始时间  info.endDate(string)=销售结束时间\n  info.stockType(boolean)=备货类型  info.lengthWidthHeight(string)=长宽高\n  info.weight(number)=重量(kg)  info.isFragile(boolean)=是否易碎\n  info.purchaseDeliver(number)=采购交期  info.deliveryDateType(number)=采购交期类型\n  info.isReturn(boolean)=能否退货  info.isExchange(boolean)=能否换货\n  info.isCustomized(boolean)=是否定制  info.isPreferred(boolean)=是否维嘉优选\n  info.deliveryMethod(number)=发货方式\n  示例: -s \'{"name":"液压缸-50mm","specs":{"材质":["不锈钢","碳钢"]},"salesPrice":100,"stock":50}\'')
    .action(async (options) => {
      const client = new ApiClient(getApiUrl());

      // Commander.js 重复 -s 只保留最后一个，手动从 argv 收集所有值
      const rawSkus: string[] = [];
      for (let i = 0; i < process.argv.length; i++) {
        if (process.argv[i] === '-s' || process.argv[i] === '--sku') {
          rawSkus.push(process.argv[++i]);
        }
      }

      const skus: any[] = [];
      for (const input of rawSkus) {
        try {
          const sku = JSON.parse(input);
          // attributes 数组序列化到 attributesJson（规避 FastJSON 中文 field name 解析 bug）
          if (sku.attributes && Array.isArray(sku.attributes)) {
            sku.attributesJson = JSON.stringify(sku.attributes);
            delete sku.attributes;
          }
          skus.push(sku);
        } catch {
          error(`JSON 解析失败：${input}`);
          process.exit(1);
        }
      }

      // 解析 SPU 级 specs — 自动检测 JSON 数组（→ fullSpecs）vs 对象（→ specs）
      let specs: Record<string, string[]> | undefined;
      let fullSpecs: any[] | undefined;
      if (options.specs) {
        try {
          const parsed = JSON.parse(options.specs);
          if (Array.isArray(parsed)) {
            fullSpecs = parsed;
          } else {
            specs = parsed;
          }
        } catch {
          error(`--specs JSON 解析失败：${options.specs}`);
          process.exit(1);
        }
      }

      const dto: QuickCreateDto = {
        spuId: options.spuId,
        spuName: options.spuName,
        brandId: options.brandId ? parseInt(options.brandId) : undefined,
        brandName: options.brandName,
        categoryId: options.categoryId ? parseInt(options.categoryId) : undefined,
        categoryName: options.categoryName,
        vendorId: options.vendorId,
        vendorName: options.vendorName,
        managerId: options.managerId,
        description: options.description,
        images: options.images,
        series: options.series,
        tag: options.tag,
        brandIdList: options.brandIds ? options.brandIds.split(',').map(Number) : undefined,
        productCategoryShow: options.categoryShow,
        canBeReturned: options.canBeReturned !== undefined ? options.canBeReturned : undefined,
        pdfLink: options.pdfLink,
        details: options.details,
        modelRemark: options.modelRemark,
        salesDeliver: options.salesDeliver ? parseInt(options.salesDeliver) : undefined,
        esKeyword: options.esKeyword,
        buySpec: options.buySpec !== undefined ? options.buySpec : undefined,
        stopProduction: options.stopProduction,
        specs,
        fullSpecs,
        skus: skus.length > 0 ? skus : undefined,
      };

      try {
        const result = await quickCreate(client, dto);
        const hasSpecs = specs || fullSpecs;
        const msg = skus.length > 0
          ? `创建成功：SPU ID=${result.spuId}，生成 SKU ${result.skuIds.length} 个：${result.skuIds.join(', ')}`
          : `创建成功：SPU ID=${result.spuId}（未创建 SKU）`;
        success(msg);
        if (hasSpecs && skus.length === 0) {
          info('提示：已创建规格，如需立即在搜索结果中体现请刷新 ES。');
        }
      } catch (e: any) {
        error(e);
        process.exit(1);
      }
    });
}
