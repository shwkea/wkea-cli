import { Command } from 'commander';
import * as fs from 'fs';
import * as path from 'path';
import COS from 'cos-nodejs-sdk-v5';
import { ApiClient } from '../api/client';
import { getCosCredential, UploadPaths } from '../api/upload';
import { getApiUrl } from '../config';
import { success, error, info } from '../utils/printer';

const COS_URL = 'https://cos.wkea.cn/';

export function registerUploadCommand(program: Command) {
  program
    .command('upload')
    .description('上传文件到 COS（产品图片、需求附件、品牌Logo等）')
    .requiredOption('--file <path>', '本地文件路径')
    .option('--type <type>', `上传类型（决定存储路径）。可选: ${Object.keys(UploadPaths).join(', ')}`, 'general')
    .option('--sub <name>', '自定义子路径（拼接在类型路径后面）')
    .action(async (options) => {
      const filePath = options.file;
      if (!fs.existsSync(filePath)) {
        error(`文件不存在：${filePath}`);
        process.exit(1);
      }

      const basePath = UploadPaths[options.type] || UploadPaths.general;
      const ext = path.extname(filePath);
      const baseName = path.basename(filePath, ext).replace(/[^a-zA-Z0-9一-龥_-]/g, '_');
      const key = `${basePath}${options.sub ? options.sub + '/' : ''}${baseName}-${Date.now()}${ext}`;

      info(`上传中：${filePath} → ${COS_URL}${key}`);

      const client = new ApiClient(getApiUrl());
      const cred = await getCosCredential(client);

      const cos = new COS({
        getAuthorization(_options, callback) {
          callback({
            TmpSecretId: cred.secretId,
            TmpSecretKey: cred.secretKey,
            SecurityToken: cred.token,
            StartTime: cred.startTime,
            ExpiredTime: cred.expiredTime,
          });
        },
      });

      await new Promise<void>((resolve, reject) => {
        cos.putObject({
          Bucket: cred.bucket,
          Region: cred.region,
          Key: key,
          Body: fs.createReadStream(filePath),
        }, (err, _data) => {
          if (err) return reject(err);
          resolve();
        });
      });

      const url = COS_URL + key;
      success(`上传成功：${url}`);
      console.log(url); // 纯 URL 输出，方便管道
    });
}
