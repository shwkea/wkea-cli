import { Command } from 'commander';
import { ApiClient } from '../../api/client';
import {
  createOrder,
  listOrders,
  orderDetail,
  deleteOrder,
  cancelOrder,
  confirmOrder,
  confirmPayment,
  createShipOrder,
  shipOrder,
  backOrder,
  orderDeliveries,
  orderOutboundOrders,
} from '../../api/sales-order';
import { formatJsonWithFields, formatOperation } from '../../utils/formatter';
import { success, error } from '../../utils/printer';
import { getApiUrl } from '../../config';

const ORDER_LIST_FIELDS = [
  { field: 'id', type: 'string', desc: '订单ID' },
  { field: 'customerName', type: 'string', desc: '客户名称' },
  { field: 'status', type: 'number', desc: '订单状态' },
  { field: 'totalAmount', type: 'number', desc: '订单金额' },
  { field: 'manageName', type: 'string', desc: '负责人' },
  { field: 'createdTime', type: 'string', desc: '创建时间' },
  { field: 'deliveryStatus', type: 'string', desc: '发货状态' },
];

const ORDER_DETAIL_FIELDS = [
  { field: 'id', type: 'string', desc: '订单ID' },
  { field: 'customerId', type: 'number', desc: '客户ID' },
  { field: 'customerName', type: 'string', desc: '客户名称' },
  { field: 'status', type: 'number', desc: '订单状态' },
  { field: 'totalAmount', type: 'number', desc: '订单金额' },
  { field: 'manageName', type: 'string', desc: '负责人' },
  { field: 'createdTime', type: 'string', desc: '创建时间' },
  { field: 'deliveryStatus', type: 'string', desc: '发货状态' },
  { field: 'paymentMethod', type: 'string', desc: '支付方式' },
  { field: 'paymentTime', type: 'string', desc: '付款时间' },
  { field: 'contactName', type: 'string', desc: '收货人' },
  { field: 'contactPhone', type: 'string', desc: '联系电话' },
  { field: 'address', type: 'string', desc: '收货地址' },
  { field: 'remark', type: 'string', desc: '备注' },
];

const DELIVERY_FIELDS = [
  { field: 'id', type: 'string', desc: '发货单ID' },
  { field: 'logisticsCompany', type: 'string', desc: '物流公司' },
  { field: 'trackingNumber', type: 'string', desc: '运单号' },
  { field: 'status', type: 'number', desc: '状态' },
  { field: 'createdTime', type: 'string', desc: '创建时间' },
];

const OUTBOUND_FIELDS = [
  { field: 'id', type: 'number', desc: '出库单ID' },
  { field: 'sku', type: 'string', desc: 'SKU' },
  { field: 'quantity', type: 'number', desc: '数量' },
  { field: 'warehouseName', type: 'string', desc: '仓库' },
  { field: 'createdTime', type: 'string', desc: '创建时间' },
];

export function registerSalesOrderCommands(program: Command) {

  // ========== 基础 CRUD ==========

  // create
  program
    .command('create')
    .description('创建销售订单')
    .requiredOption('--data <json>', '订单数据JSON（含客户、收货、行项目等）')
    .action(async (opts) => {
      const client = new ApiClient(getApiUrl());
      try {
        const dto = JSON.parse(opts.data);
        const orderId = await createOrder(client, dto);
        success(`创建成功，订单ID: ${orderId}`);
      } catch (e: any) {
        error(e);
        process.exit(1);
      }
    });

  // list
  program
    .command('list')
    .description('销售订单列表（分页）')
    .option('--id <id>', '订单编号/ID')
    .option('--page-num <number>', '页码（默认1）', '1')
    .option('--page-size <number>', '每页条数（默认20）', '20')
    .option('--order-id <id>', '订单ID')
    .option('--customer-name <name>', '客户名称')
    .option('--manage-id <number>', '负责人ID')
    .option('--sku <sku>', 'SKU')
    .option('--status <json>', '订单状态数组，如 "[110,111]"')
    .option('--time-begin <time>', '创建时间开始')
    .option('--time-end <time>', '创建时间结束')
    .option('--customer-id <id>', '客户ID')
    .option('--pay-type <type>', '支付方式')
    .option('--order-type <type>', '订单渠道（枚举ID: 订单渠道，enum --type 订单渠道 查看可用值）')
    .option('--invoice-type <type>', '开票状态')
    .option('--min-price <price>', '最小金额')
    .option('--max-price <price>', '最大金额')
    .action(async (opts) => {
      const client = new ApiClient(getApiUrl());
      try {
        const dto: any = { pageNum: parseInt(opts.pageNum), pageSize: parseInt(opts.pageSize) };
        if (opts.orderId) dto.orderId = opts.orderId;
        if (opts.customerName) dto.customerName = opts.customerName;
        if (opts.manageId) dto.manageId = opts.manageId;
        if (opts.sku) dto.sku = opts.sku;
        if (opts.status) dto.orderStatus = JSON.parse(opts.status);
        if (opts.timeBegin) dto.beginTime = opts.timeBegin;
        if (opts.timeEnd) dto.endTime = opts.timeEnd;
        if (opts.customerId) dto.customerId = opts.customerId;
        if (opts.payType) dto.payType = parseInt(opts.payType);
        if (opts.orderType) dto.orderType = parseInt(opts.orderType);
        if (opts.invoiceType) dto.invoiceType = parseInt(opts.invoiceType);
        if (opts.minPrice) dto.minPrice = parseFloat(opts.minPrice);
        if (opts.maxPrice) dto.maxPrice = parseFloat(opts.maxPrice);
        const data = await listOrders(client, dto);
        console.log(formatJsonWithFields(data, ORDER_LIST_FIELDS));
      } catch (e: any) {
        error(e);
        process.exit(1);
      }
    });

  // get
  program
    .command('get')
    .description('订单详情')
    .requiredOption('--id <id>', '订单ID（必填）')
    .action(async (opts) => {
      const client = new ApiClient(getApiUrl());
      try {
        const data = await orderDetail(client, opts.id);
        console.log(formatJsonWithFields(data, ORDER_DETAIL_FIELDS));
      } catch (e: any) {
        error(e);
        process.exit(1);
      }
    });

  // delete
  program
    .command('delete')
    .description('删除订单（仅可删除已取消的订单）')
    .requiredOption('--id <id>', '订单ID（必填）')
    .action(async (opts) => {
      const client = new ApiClient(getApiUrl());
      try {
        await deleteOrder(client, opts.id);
        success(formatOperation('删除订单'));
      } catch (e: any) {
        error(e);
        process.exit(1);
      }
    });

  // ========== 业务操作 ==========

  // cancel
  program
    .command('cancel')
    .description('取消订单')
    .requiredOption('--id <id>', '订单ID（必填）')
    .action(async (opts) => {
      const client = new ApiClient(getApiUrl());
      try {
        await cancelOrder(client, opts.id);
        success(formatOperation('取消订单'));
      } catch (e: any) {
        error(e);
        process.exit(1);
      }
    });

  // confirm
  program
    .command('confirm')
    .description('确认订单（审核）')
    .requiredOption('--id <id>', '订单ID（必填）')
    .action(async (opts) => {
      const client = new ApiClient(getApiUrl());
      try {
        await confirmOrder(client, opts.id);
        success(formatOperation('确认订单'));
      } catch (e: any) {
        error(e);
        process.exit(1);
      }
    });

  // confirm-payment
  program
    .command('confirm-payment')
    .description('确认付款')
    .requiredOption('--id <id>', '订单ID（必填）')
    .requiredOption('--payment-time <time>', '付款时间（如 2025-01-01 12:00:00）')
    .action(async (opts) => {
      const client = new ApiClient(getApiUrl());
      try {
        await confirmPayment(client, {
          orderId: opts.id,
          paymentTime: opts.paymentTime,
        });
        success(formatOperation('确认付款'));
      } catch (e: any) {
        error(e);
        process.exit(1);
      }
    });

  // create-ship-order
  program
    .command('create-ship-order')
    .description('创建发货单')
    .requiredOption('--id <id>', '订单ID（必填）')
    .requiredOption('--items <json>', '发货项目JSON数组：[{"itemId":1,"quantity":5}]')
    .action(async (opts) => {
      const client = new ApiClient(getApiUrl());
      try {
        const items = JSON.parse(opts.items);
        const deliverId = await createShipOrder(client, {
          orderId: opts.id,
          items,
        });
        success(`创建发货单成功，发货单ID: ${deliverId}`);
      } catch (e: any) {
        error(e);
        process.exit(1);
      }
    });

  // ship
  program
    .command('ship')
    .description('发货（录入物流信息）')
    .requiredOption('--id <id>', '订单ID（必填）')
    .requiredOption('--deliver-id <id>', '发货单ID')
    .option('--logistics-company-id <id>', '物流公司ID（57=顺丰 58=德邦 59=安能 60=货拉拉，与 --name 二选一）')
    .option('--logistics-company <name>', '物流公司名称（支持：顺丰快递/德邦快递/安能物流/货拉拉物流，与 --id 二选一）')
    .requiredOption('--tracking-number <number>', '运单号')
    .action(async (opts) => {
      const client = new ApiClient(getApiUrl());
      try {
        await shipOrder(client, {
          orderId: opts.id,
          deliverId: opts.deliverId,
          logisticsCompanyId: opts.logisticsCompanyId ? parseInt(opts.logisticsCompanyId) : undefined,
          logisticsCompany: opts.logisticsCompany,
          trackingNumber: opts.trackingNumber,
        });
        success(formatOperation('发货'));
      } catch (e: any) {
        error(e);
        process.exit(1);
      }
    });

  // back-order
  program
    .command('back-order')
    .description('回库（已发货订单退回仓库）')
    .requiredOption('--id <id>', '订单ID（必填）')
    .action(async (opts) => {
      const client = new ApiClient(getApiUrl());
      try {
        await backOrder(client, opts.id);
        success(formatOperation('回库'));
      } catch (e: any) {
        error(e);
        process.exit(1);
      }
    });

  // ========== 查询子列表 ==========

  // deliveries
  program
    .command('deliveries')
    .description('查看订单的发货单列表')
    .requiredOption('--id <id>', '订单ID（必填）')
    .option('--page-num <number>', '页码（默认1）', '1')
    .option('--page-size <number>', '每页条数（默认20）', '20')
    .action(async (opts) => {
      const client = new ApiClient(getApiUrl());
      try {
        const data = await orderDeliveries(client, opts.id, parseInt(opts.pageNum), parseInt(opts.pageSize));
        console.log(formatJsonWithFields(data, DELIVERY_FIELDS));
      } catch (e: any) {
        error(e);
        process.exit(1);
      }
    });

  // outbound-orders
  program
    .command('outbound-orders')
    .description('查看订单的出库单列表')
    .requiredOption('--id <id>', '订单ID（必填）')
    .option('--page-num <number>', '页码（默认1）', '1')
    .option('--page-size <number>', '每页条数（默认20）', '20')
    .action(async (opts) => {
      const client = new ApiClient(getApiUrl());
      try {
        const data = await orderOutboundOrders(client, opts.id, parseInt(opts.pageNum), parseInt(opts.pageSize));
        console.log(formatJsonWithFields(data, OUTBOUND_FIELDS));
      } catch (e: any) {
        error(e);
        process.exit(1);
      }
    });
}
