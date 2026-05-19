import { Command } from 'commander';
import { ApiClient } from '../../api/client';
import {
  createContract,
  listContracts,
  contractDetail,
  updateContract,
  deleteContract,
  transferOrder,
  createContractLine,
  listContractLines,
  getContractLine,
  updateContractLine,
  deleteContractLine,
} from '../../api/sales-contract';
import { formatJsonWithFields, formatOperation } from '../../utils/formatter';
import { success, error } from '../../utils/printer';
import { getApiUrl } from '../../config';

const CONTRACT_LIST_FIELDS = [
  { field: 'id', type: 'string', desc: '合同ID' },
  { field: 'customerId', type: 'string', desc: '客户ID' },
  { field: 'customerName', type: 'string', desc: '客户名称' },
  { field: 'totalAmount', type: 'number', desc: '合同金额' },
  { field: 'status', type: 'number', desc: '状态' },
  { field: 'createdTime', type: 'string', desc: '创建时间' },
  { field: 'manageName', type: 'string', desc: '负责人' },
];

const CONTRACT_DETAIL_FIELDS = [
  { field: 'id', type: 'string', desc: '合同ID' },
  { field: 'customerId', type: 'string', desc: '客户ID' },
  { field: 'customerName', type: 'string', desc: '客户名称' },
  { field: 'totalAmount', type: 'number', desc: '合同金额' },
  { field: 'status', type: 'number', desc: '状态' },
  { field: 'manageName', type: 'string', desc: '负责人' },
  { field: 'createdTime', type: 'string', desc: '创建时间' },
  { field: 'remark', type: 'string', desc: '备注' },
  { field: 'lines', type: 'array', desc: '合同行项目' },
];

export function registerSalesContractCommands(program: Command) {

  // create
  program
    .command('create')
    .description('创建销售合同')
    .requiredOption('--data <json>', '合同数据JSON（含客户、行项目等）')
    .action(async (opts) => {
      const client = new ApiClient(getApiUrl());
      try {
        const dto = JSON.parse(opts.data);
        const id = await createContract(client, dto);
        success(`创建成功，合同ID: ${id}`);
      } catch (e: any) {
        error(e);
        process.exit(1);
      }
    });

  // list
  program
    .command('list')
    .description('销售合同列表（分页）')
    .option('--page-num <number>', '页码（默认1）', '1')
    .option('--page-size <number>', '每页条数（默认20）', '20')
    .option('--id <id>', '合同ID')
    .option('--customer-id <id>', '客户ID')
    .option('--time-begin <time>', '创建时间开始（格式: 2024-01-01）')
    .option('--time-end <time>', '创建时间结束（格式: 2024-12-31）')
    .action(async (opts) => {
      const client = new ApiClient(getApiUrl());
      try {
        const dto: any = { pageNum: parseInt(opts.pageNum), pageSize: parseInt(opts.pageSize) };
        if (opts.id) dto.id = opts.id;
        if (opts.customerId) dto.customerId = opts.customerId;
        if (opts.timeBegin) dto.beginTime = opts.timeBegin;
        if (opts.timeEnd) dto.endTime = opts.timeEnd;
        const data = await listContracts(client, dto);
        console.log(formatJsonWithFields(data, CONTRACT_LIST_FIELDS));
      } catch (e: any) {
        error(e);
        process.exit(1);
      }
    });

  // get
  program
    .command('get')
    .description('合同详情')
    .requiredOption('--id <id>', '合同ID（必填）')
    .action(async (opts) => {
      const client = new ApiClient(getApiUrl());
      try {
        const data = await contractDetail(client, opts.id);
        console.log(formatJsonWithFields(data, CONTRACT_DETAIL_FIELDS));
      } catch (e: any) {
        error(e);
        process.exit(1);
      }
    });

  // update
  program
    .command('update')
    .description('修改销售合同（仅修改合同头信息，行项目通过 line-* 子命令管理）')
    .requiredOption('--data <json>', '合同数据JSON（含id，不含lines）')
    .action(async (opts) => {
      const client = new ApiClient(getApiUrl());
      try {
        const dto = JSON.parse(opts.data);
        await updateContract(client, dto);
        success(formatOperation('修改合同'));
      } catch (e: any) {
        error(e);
        process.exit(1);
      }
    });

  // delete
  program
    .command('delete')
    .description('删除销售合同')
    .requiredOption('--id <id>', '合同ID（必填）')
    .action(async (opts) => {
      const client = new ApiClient(getApiUrl());
      try {
        await deleteContract(client, opts.id);
        success(formatOperation('删除合同'));
      } catch (e: any) {
        error(e);
        process.exit(1);
      }
    });

  // transfer-order
  program
    .command('transfer-order')
    .description('销售合同转订单')
    .requiredOption('--id <id>', '合同ID（必填）')
    .requiredOption('--manage-id <id>', '负责人ID')
    .requiredOption('--distribution-mode <number>', '配送方式（118=整单发货 119=有货先发 403=堂食）')
    .requiredOption('--pay-type <number>', '支付方式')
    .option('--customer-freight <number>', '客户运费', '0')
    .option('--has-freight', '是否含运', false)
    .requiredOption('--items <json>', '转订单行项目JSON：[{"productSkuId":"W000000001","amount":2}]')
    .action(async (opts) => {
      const client = new ApiClient(getApiUrl());
      try {
        await transferOrder(client, opts.id, {
          manageId: opts.manageId,
          distributionMode: parseInt(opts.distributionMode),
          payType: parseInt(opts.payType),
          customerFreight: parseFloat(opts.customerFreight),
          hasFreight: opts.hasFreight,
          orderItems: JSON.parse(opts.items),
        });
        success(formatOperation('合同转订单'));
      } catch (e: any) {
        error(e);
        process.exit(1);
      }
    });

  // ========== 合同行项目 CRUD ==========

  program
    .command('create-line')
    .description('新增合同行项目')
    .requiredOption('--contract-id <id>', '合同ID（必填）')
    .requiredOption('--sku <sku>', 'SKU（必填）')
    .requiredOption('--unit <unit>', '单位（枚举ID: 单位，enum --type 单位 查看可用值）')
    .requiredOption('--amount <amount>', '数量（必填）')
    .option('--price <price>', '单价')
    .option('--sort <sort>', '排序')
    .action(async (opts) => {
      const client = new ApiClient(getApiUrl());
      try {
        const dto: Record<string, any> = {
          sku: opts.sku,
          unit: parseInt(opts.unit),
          amount: parseInt(opts.amount),
        };
        if (opts.price) dto.price = parseFloat(opts.price);
        if (opts.sort !== undefined) dto.sort = parseInt(opts.sort);
        const result = await createContractLine(client, opts.contractId, dto);
        console.log(formatJsonWithFields(result, [
          { field: 'sku', type: 'string', desc: 'SKU' },
          { field: 'unit', type: 'number', desc: '单位' },
          { field: 'amount', type: 'number', desc: '数量' },
          { field: 'price', type: 'number', desc: '单价' },
        ]));
        success('行项目创建成功');
      } catch (e: any) { error(e); process.exit(1); }
    });

  program
    .command('list-lines')
    .description('合同行项目列表')
    .requiredOption('--contract-id <id>', '合同ID（必填）')
    .action(async (opts) => {
      const client = new ApiClient(getApiUrl());
      try {
        const data = await listContractLines(client, opts.contractId);
        if (data.length === 0) {
          console.log('暂无行项目');
          return;
        }
        console.log(formatJsonWithFields(data, [
          { field: 'sku', type: 'string', desc: 'SKU' },
          { field: 'unit', type: 'number', desc: '单位' },
          { field: 'amount', type: 'number', desc: '数量' },
          { field: 'price', type: 'number', desc: '单价' },
          { field: 'sort', type: 'number', desc: '排序' },
        ]));
      } catch (e: any) { error(e); process.exit(1); }
    });

  program
    .command('update-line')
    .description('修改合同行项目')
    .requiredOption('--contract-id <id>', '合同ID（必填）')
    .requiredOption('--line-id <id>', '行项目ID（必填）')
    .option('--sku <sku>', 'SKU')
    .option('--unit <unit>', '单位（枚举ID）')
    .option('--amount <amount>', '数量')
    .option('--price <price>', '单价')
    .option('--sort <sort>', '排序')
    .action(async (opts) => {
      const client = new ApiClient(getApiUrl());
      try {
        const dto: Record<string, any> = {};
        if (opts.sku) dto.sku = opts.sku;
        if (opts.unit) dto.unit = parseInt(opts.unit);
        if (opts.amount) dto.amount = parseInt(opts.amount);
        if (opts.price) dto.price = parseFloat(opts.price);
        if (opts.sort !== undefined) dto.sort = parseInt(opts.sort);
        await updateContractLine(client, opts.contractId, opts.lineId, dto);
        success(formatOperation('更新'));
      } catch (e: any) { error(e); process.exit(1); }
    });

  program
    .command('delete-line')
    .description('删除合同行项目')
    .requiredOption('--contract-id <id>', '合同ID（必填）')
    .requiredOption('--line-id <id>', '行项目ID（必填）')
    .action(async (opts) => {
      const client = new ApiClient(getApiUrl());
      try {
        await deleteContractLine(client, opts.contractId, opts.lineId);
        success(formatOperation('删除'));
      } catch (e: any) { error(e); process.exit(1); }
    });
}
