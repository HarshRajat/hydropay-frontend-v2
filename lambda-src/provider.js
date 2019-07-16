import {providers, Wallet} from 'ethers'

const provider = new providers.JsonRpcProvider(process.env.REACT_APP_INFURA_URL);
const wallet = new Wallet(process.env.REACT_APP_PRIVATE_KEY, provider);
const demoHelperAddress = process.env.REACT_APP_DEMOHELPER_ADDRESS.toLowerCase();
const snowflakeAddress = process.env.REACT_APP_SNOWFLAKE_ADDRESS.toLowerCase();
const allowedIPs = process.env.REACT_APP_ALLOWED_IPS.split(",");

export async function handler(event) {
  try {
    const ip = event.headers["client-ip"];
    if (allowedIPs.indexOf(ip) === -1)
      return {
        statusCode: 401,
        body: JSON.stringify({message: "\"" + ip + "\" address is forbidden"})
      };

    const {to, transactionData, nonce} = JSON.parse(event.body);
    if (to.toLowerCase() !== demoHelperAddress && to.toLowerCase() !== snowflakeAddress)
      return {
        statusCode: 403,
        body: JSON.stringify({message: "\"" + to + "\" address is forbidden"})
      };

    const nonceTx = (!!nonce) ? nonce : await provider.getTransactionCount(wallet.address, 'latest');

    // provider.getGasPrice().then((gasPrice) => {
    //     // gasPrice is a BigNumber; convert it to a decimal string
    //     gasPriceString = gasPrice.toString();

    //     console.log("Current gas price: " + gasPriceString);
    // });

    // Normally we would let the Wallet populate this for us, but we
    // need to compute EXACTLY how much value to send
    let gasPrice = await provider.getGasPrice();

    // Increase it by 2
    gasPrice = gasPrice * 2;

    // Increase by 2 logic
    //let maxGasPrice = 4 * 1000000000; // 4 GWei
    let maxGasPrice = 25 * 1000000000; // 25 GWei

    // let maxGasPrice = 3 * 1000000000; // 3 GWei

    if (gasPrice > maxGasPrice) {
        gasPrice = maxGasPrice;
    }

    // Temporary increase gas
    // gasPrice = 5 * 1000000000; // 3 GWei

    // The exact cost (in gas) to send to an Externally Owned Account (EOA)
    // let gasLimit = 21000;

    const tx = {
      to: to,
      data: transactionData,
      nonce: nonceTx,
      gasPrice: gasPrice,
    };

    const transaction = await wallet.sendTransaction(tx);

    return {
      statusCode: 200,
      body: JSON.stringify({transactionHash: transaction.hash})
    }
  } catch (error) {
    console.log(error);
    return {
      statusCode: 500,
      body: JSON.stringify({message: error.toString()})
    }
  }
}
