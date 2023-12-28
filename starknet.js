const { Contract, Account, RpcProvider } = require("starknet");

// 发送铭文的账户,privateKey(私钥) accountAddress(账户地址)
var accounts = [
    {
        privateKey: '',
        accountAddress: ''
    }
]

// 提供者列表，可自行添加，或修改对应的节点地址，修改nodeUrl即可
const providers = [
    new RpcProvider({ nodeUrl: 'https://starknet-mainnet.infura.io/v3/521b311718be4716b9e3b2fcf96e9bae' })
];


// 铭刻铭文的合约地址，以之前的 STRKI为例
const tokenAddr = '0x07341189e3c96f636a4192cfba8c18deeee33a19c5d0425a26cf96ea42388c4e';
// 注意，这个abi地址，如果代币的合约有代理合约，那么这个abi地址就是代理合约的地址
const tokenAbiAddr = '0x07341189e3c96f636a4192cfba8c18deeee33a19c5d0425a26cf96ea42388c4e';

// 铭文配置
const limit = 10; // 铭刻次数
const sleepTime = 1000; // 铭刻一次之后睡眠次数

// 方法传参，这个比较麻烦，需要看被人铭刻的具体方法参数，然后将hex数组拉下来
const dataTmp = '63,100,97,116,97,58,44,123,34,112,34,58,34,115,116,97,114,107,45,50,48,34,44,34,111,112,34,58,34,109,105,110,116,34,44,34,116,105,99,107,34,58,34,83,84,65,82,75,73,34,44,34,97,109,116,34,58,34,49,48,48,48,34,125';


//-----------------------以下为函数-----------------------//
// 铭刻铭文
const transfer = async (account, provider) => {
    // 1、通过abi地址获取abi
    const { abi: ercABI } = await provider.getClassAt(tokenAbiAddr);
    if (ercABI === undefined) { throw new Error("no abi.") };
    // 2、构建合约对象
    const erc20 = new Contract(ercABI, tokenAddr, provider);
    // 3、将合约对象连接到账户
    erc20.connect(account);
    while (true) {
        try {
            // 4、获取当前代币余额
            const data = dataTmp.split(',');
            const rep = await erc20.inscribe(data);
            await sleep(sleepTime)
            console.log(rep)
        }
        catch (error) {
            await sleep(20000)
            console.log(error)
        }
    }
}

const task = async (value, i) => {
    const privateKey = value.privateKey;
    const accountAddress = value.accountAddress;

    // provider根据循环的i使用%来选择,防止单个provider被封
    let provider = providers[i % providers.length];

    // 1、生成需要归集的account
    const account = new Account(provider, accountAddress, privateKey);

    // 3、打铭文
    transfer(account, provider);
}

function main() {
    for (let i = 0; i < accounts.length; i++) {
        task(accounts[i], i);
    }
}


async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

main();

