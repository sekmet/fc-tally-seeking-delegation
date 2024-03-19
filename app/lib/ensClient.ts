// Import viem transport, viem chain, and ENSjs
import { addEnsContracts } from "@ensdomains/ensjs";
import { getAddressRecord } from "@ensdomains/ensjs/public";
import { createClient, http } from "viem";
import { mainnet } from "viem/chains";

export async function ensToAddress(ens: string) {
  // Create the client
  const client = createClient({
    chain: addEnsContracts(mainnet),
    transport: http(),
  });
  // Use the client
  const ethAddress = await getAddressRecord(client, { name: ens });

  return ethAddress ? ethAddress.value : null;
}
