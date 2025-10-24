import { HashConnect } from "hashconnect";
import { AccountId, LedgerId, ContractExecuteTransaction, ContractFunctionParameters, Hbar, Transaction, Signer } from "@hashgraph/sdk";

let hc: HashConnect | null = null;
let initPromise: Promise<any> | null = null;
const env = "testnet"; // ou "mainnet"
const appMetadata = {
  name: "CarbonChain Africa",
  description: "A decentralized carbon credit marketplace for Africa.",
  icons: [typeof window !== 'undefined' ? window.location.origin + "/favicon.ico" : "/favicon.ico"],
  url: typeof window !== 'undefined' ? window.location.origin : "http://localhost:3000",
};

export const getHashConnect = async () => {
  if (hc) return hc;

  if (typeof window === 'undefined') {
    throw new Error("HashConnect can only be initialized on the client side.");
  }

  const { HashConnect } = await import('hashconnect');
  hc = new HashConnect(
     LedgerId.fromString(env),
    "bfa190dbe93fcf30377b932b31129d05",
    appMetadata,
    true
  );
  return hc;
};
