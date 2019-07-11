import {providers, Wallet} from 'ethers'

const provider = new providers.JsonRpcProvider(process.env.REACT_APP_INFURA_URL);
const wallet = new Wallet(process.env.REACT_APP_PRIVATE_KEY, provider);
const demoHelperAddress = process.env.REACT_APP_DEMOHELPER_ADDRESS.toLowerCase();
const snowflakeAddress = process.env.REACT_APP_SNOWFLAKE_ADDRESS.toLowerCase();

export async function handler(event) {
  try {
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
    let maxGasPrice = 3 * 1000000000; // 3 GWei

    if (gasPrice > maxGasPrice) {
      gasPrice = maxGasPrice;
    }

    // The exact cost (in gas) to send to an Externally Owned Account (EOA)
    // let gasLimit = 21000;

    const tx = {
      to: to,
      data: transactionData,
      nonce: nonceTx,
      //gasPrice: gasPrice,
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
