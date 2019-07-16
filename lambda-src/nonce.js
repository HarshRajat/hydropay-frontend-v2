import {providers, Wallet} from 'ethers'

const provider = new providers.JsonRpcProvider(process.env.REACT_APP_INFURA_URL);
const allowedIPs = process.env.REACT_APP_ALLOWED_IPS.split(",");

export async function handler(event) {
  try {
    const ip = event.headers["client-ip"];
    if (allowedIPs.indexOf(ip) === -1)
      return {
        statusCode: 401,
        body: JSON.stringify({message: "\"" + ip + "\" address is unauthorized"})
      };

    const {wallet_id} = JSON.parse(event.body);
    if (isNaN(wallet_id) || wallet_id <= 0 || wallet_id > process.env.REACT_APP_PRIVATE_KEY_COUNT)
      return {
        statusCode: 403,
        body: JSON.stringify({message: "\"" + wallet_id + "\" is forbidden"})
      };
    const pkey = process.env["REACT_APP_PRIVATE_KEY_" + wallet_id];
    if (pkey === undefined)
      return {
        statusCode: 403,
        body: JSON.stringify({message: "\"" + wallet_id + "\" is forbidden"})
      };

    const wallet = new Wallet(pkey, provider);
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
