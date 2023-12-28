/**
 * 前提， 终端中执行
 * npm update
 * npm i @cosmjs/stargate
 * npm i @cosmjs/proto-signing
 * npm i cosmos-lib
 */
const { SigningStargateClient, GasPrice, coins } = require("@cosmjs/stargate");
const { DirectSecp256k1Wallet } = require('@cosmjs/proto-signing');
const { base64FromBytes } = require("cosmjs-types/helpers");
const { crypto } = require("cosmos-lib");

// cosmos链配置，以 tia为例
const denom = 'utia' //币的面额，不知道怎么解释，基本上就是 前面加个u，然后小写，比如 uatom ujuno
const chain = 'celestia' // 链的简称
const tokenDecimal = 1000000 // 代币的小数位
const rpcEndpoint = 'https://public-celestia-rpc.numia.xyz'  // rpc节点

// gas 配置, 可以先用kepler转账一次，看下当前需要多少
const gasAmount = '10000'
const gasLimit = '100000'

// 铭文配置
const memo = `data:,{"op":"mint","amt":10000,"tick":"cias","p":"cia-20"}` // 铭文data
const inscrlimt = 100; // 打多少次
const gas = 0.025
const amountCount = 100; // 自转币的数量，真实转账数量是 amountCount / 代笔的小数位

// 钱包配置
const mnemonic = '' //钱包助记词



async function performTransaction() {
    const gasPrice = GasPrice.fromString(`${gas}${denom}`);
    const keys = crypto.getKeysFromMnemonic(mnemonic);
    const wallet = await DirectSecp256k1Wallet.fromKey(Buffer.from(keys.privateKey, "hex"), chain);
    const client = await SigningStargateClient.connectWithSigner(rpcEndpoint, wallet, { gasPrice: gasPrice });
    const fee = {
        amount: coins(gasAmount, denom),
        gas: gasLimit,
    };

    for (let j = 0; j < inscrlimt; j++) {
        try {
            const [account] = await wallet.getAccounts();
            const amount = coins(1, denom);

            const result = await client.sendTokens(account.address, account.address, amount, fee, base64FromBytes(Buffer.from(memo, 'utf8')));
            console.log(result);
        } catch (error) {
            console.error('失败: ', error);
            await sleep(sleepTime)
        }
    }
}

async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
    performTransaction();
}

main();
