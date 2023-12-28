/**
 * 批量打evm的铭文，极度的简单，最主要的三要素
 * 1、节点地址
 * 2、钱包私钥
 * 3、铭文json
 * 
 * 通俗来说，evm的铭文，就是给自己发送一段hex即可，所以抽象来看，打铭文就是给自己执行一段0转交易
 */
const ethers = require('ethers');


const info = [
    {
        'pk' : '', // 私钥
        'providers' : [
            // 可以输入多个节点地址，防止单节点错误
            new ethers.JsonRpcProvider('https://opbnb.publicnode.com'),
            new ethers.JsonRpcProvider('节点2')
        ],
        'inscriJson' : 'data:,{"p":"derp-20","op":"mint","tick":"derps","amt":"1000"}', // 铭文json，不需要json的话可以不填,
        'toAdd' : '', // 发送方地址，如果是发给合约则填写合约地址，如果是发给自己则填写自己的地址
        'inscrlimt' : 6000, // 铭刻的数量
        'sleepTime' : '1000' // 休眠时间，单位毫秒， 1000就是1秒
    },{
      'pk' : '',
        'providers' : [
            new ethers.JsonRpcProvider('节点url')
        ],
        'inscriJson' : 'data json', // 铭文json，不需要json的话可以不填,
        'toAdd' : '', 
        'inscrlimt' : 1, 
        'sleepTime' : '1' 
    }
    // 若有多个账户或者有其他链，可以继续添加
]


// ------------------------------ 以下函数方法 ------------------------------


const strToHex = (str) => {
    return '0x' + Buffer.from(str, 'utf8').toString('hex');
}

const task = async (pk, providers, inscriJson, toAdd, inscrlimt, sleepTime) => {
    // 1、构建多节点
    let accounts = [];
    for (let i in providers) {
        accounts.push(new ethers.Wallet(pk, providers[i]))
    }
    // 2、以第一个节点的Nonce为主
    let nonce = await accounts[0].getNonce();
    //let { gasPrice } = await accounts[0].provider.getFeeData()

    for (let j = 0; j < inscrlimt; j++) {
        let account =  accounts[j % providers.length];
        //let { gasPrice } = await account.provider.getFeeData()
        //console.log(gasPrice)
        let sendOptions = {
            to: toAdd,
            value: 0,
            nonce: nonce++,
            //gasPrice : gasPrice + 10n // gas费用调整
        };
        if (inscriJson) {
            sendOptions.data = strToHex(inscriJson);
        }
        // 4、发送交易
        try {
            const rep =  await account.sendTransaction(sendOptions)
            console.log("hash: " + rep.hash + ", nonce: " + rep.nonce)
        } catch (error) {
            console.log(error)
            await sleep(10000)
            nonce = await account.getNonce();
            continue;
        }
        await sleep(sleepTime)
    }
};

async function task1(info, i) {
    while (true) {
        try {
            await task(info[i].pk, info[i].providers, info[i].inscriJson, info[i].toAdd, info[i].inscrlimt, info[i].sleepTime);
        } catch (error) {
            await sleep(1000);
            console.log(error)
            continue;
        }
        break;
    } 
}

async function main() {
    // 遍历循环info,调用task
    for (let i = 0; i < info.length; i++) {
        task1(info, i)
    }
}

async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

main();
