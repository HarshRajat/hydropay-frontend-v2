import {providers, Wallet} from 'ethers'

const provider = new providers.JsonRpcProvider(process.env.REACT_APP_INFURA_URL);
const wallet = new Wallet(process.env.REACT_APP_PRIVATE_KEY, provider);
const allowedIPs = process.env.REACT_APP_ALLOWED_IPS.split(",");

export async function handler(event) {
  try {
    const ip = event.headers["client-ip"];
    if (allowedIPs.indexOf(ip) === -1)
      return {
        statusCode: 401,
        body: JSON.stringify({message: "\"" + ip + "\" address is forbidden"})
      };

    const nonce = await provider.getTransactionCount(wallet.address, 'latest');
    return {
      statusCode: 200,
      body: JSON.stringify({nonce: nonce})
    }
  } catch (error) {
    console.log(error);
    return {
      statusCode: 500,
      body: JSON.stringify({message: error.toString()})
    }
  }
}
