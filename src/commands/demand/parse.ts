import { Command } from 'commander';
import https from 'https';
import { error } from '../../utils/printer';

const AI_API = process.env.WKEA_AI_API || 'https://ai.wkea.cn';
const AI_TOKEN = process.env.WKEA_AI_TOKEN || '7a161c43d2434dde86ee685b37095841';

interface ParsedItem {
  productName: string;
  productBrand: string;
  productModel: string;
  productCategory: string;
  productUnit: string;
  quantity: number;
  expectPrice: number;
  remark: string;
  originalText: string;
}

interface ParsedResult {
  items: ParsedItem[];
  customerRemark: string;
  annex: string;
}

function callParseAPI(text: string, files: string, remark: string): Promise<ParsedResult> {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({
      text: `登记需求：${text}${remark ? `\n备注：${remark}` : ''}`,
      cid: null,
      token: AI_TOKEN,
      files: files || '',
      history: []
    });

    const url = new URL('/api/chat', AI_API);
    const req = https.request({
      hostname: url.hostname,
      path: url.pathname,
      method: 'POST',
      timeout: 60000,
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) }
    }, res => {
      let buffer = '';
      let result: ParsedResult | null = null;

      res.on('data', (chunk: Buffer) => {
        buffer += chunk.toString();
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          try {
            const evt = JSON.parse(line.substring(6));
            if (evt.toolResult?.cardData?.demandQuotationItemDtos) {
              const card = evt.toolResult.cardData;
              result = {
                items: card.demandQuotationItemDtos.map((item: any) => ({
                  productName: item.productName || '-',
                  productBrand: item.productBrand || '',
                  productModel: item.productModel || '',
                  productCategory: item.productCategory || '',
                  productUnit: item.productUnit || '',
                  quantity: item.quantity || 0,
                  expectPrice: item.expectPrice || 0,
                  remark: item.remark || '',
                  originalText: item.originalText || ''
                })),
                customerRemark: card.customerRemark || '',
                annex: card.annex || ''
              };
            }
          } catch (e) { /* parse error, skip */ }
        }
      });

      res.on('end', () => {
        if (result) resolve(result);
        else reject(new Error('未能解析出需求数据，AI可能未正确识别'));
      });
    });

    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('AI解析超时')); });
    req.write(body);
    req.end();
  });
}

export function registerParseCommand(demand: Command) {
  demand
    .command('parse')
    .description('AI解析需求文本为结构化行项目')
    .requiredOption('--text <text>', '需求描述文本（必填），如 "SMC电磁阀 VXZ-1/4-F 5个"')
    .option('--files <files>', '附件链接，多个用逗号分隔')
    .option('--remark <remark>', '需求备注')
    .option('--json', '以JSON格式输出（供其他命令调用）')
    .action(async (opts) => {
      try {
        const result = await callParseAPI(opts.text, opts.files || '', opts.remark || '');

        if (opts.json) {
          console.log(JSON.stringify(result, null, 2));
          return;
        }

        console.log(`\n解析到 ${result.items.length} 个行项目:\n`);
        result.items.forEach((item, i) => {
          const parts = [
            item.productBrand,
            item.productModel,
            item.productName !== '-' ? item.productName : ''
          ].filter(Boolean);
          console.log(`  ${i + 1}. ${parts.join(' ')} ×${item.quantity}${item.productUnit ? ' ' + item.productUnit : ''}`);
          if (item.originalText) console.log(`     原文: ${item.originalText}`);
        });

        if (result.customerRemark) console.log(`\n客户备注: ${result.customerRemark}`);
        if (result.annex) console.log(`附件: ${result.annex}`);
        console.log(`\n请检查解析结果，确认无误后使用 demand create 创建需求`);
      } catch (e: any) {
        error(e);
        process.exit(1);
      }
    });
}
