const { NodeSSH } = require("node-ssh");
const path = require("path");

const ssh = new NodeSSH();
const serverConfig = {
    host: "1.117.174.211",
    port: "22",
    username: "root",
    password: "c2h3a2VhNjY2Kio="
};

const localFile = path.join(__dirname, "使用指南.html");
const remoteDir = "/www/wwwroot/orther.wkea.cn/cli";

console.log("开始上传 使用指南.html ...");

ssh.connect(serverConfig)
    .then(() => ssh.execCommand(`mkdir -p ${remoteDir}`))
    .then(() => ssh.putFile(localFile, `${remoteDir}/使用指南.html`))
    .then(() => {
        console.log("上传成功！");
        console.log(`访问地址: https://orther.wkea.cn/cli/使用指南.html`);
    })
    .catch((err) => {
        console.error("上传失败:", err.message);
    })
    .finally(() => {
        ssh.dispose();
    });
