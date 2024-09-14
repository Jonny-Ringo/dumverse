import { result, results, message, spawn, monitor, unmonitor, dryrun, createDataItemSigner } from "@permaweb/aoconnect";
import { COMBAT_PROCESS_ID, GAME_PROCESS_ID } from "./utils";
import { MessageResult } from "@permaweb/aoconnect/dist/lib/result";

export type MyMessageResult = MessageResult & {
  data: Record<string, any>;
  status?: "Success" | "Error";
};

export async function sendAndReceiveGameMessage(tags: { name: string; value: string }[], process: "game" | "combat" = "game") {
  const action = tags.find((tag) => tag.name === "Action")?.value;
  console.log("sending message:" + action, { tags });
  const res = await message({
    process: process === "game" ? GAME_PROCESS_ID : COMBAT_PROCESS_ID,
    tags: tags,
    signer: createDataItemSigner(window.arweaveWallet),
  });
  let resultData = (await result({
    message: res,
    process: process === "game" ? GAME_PROCESS_ID : COMBAT_PROCESS_ID,
  })) as MessageResult;

  console.log("got result: " + action, { resultData });
  return handleResultData(resultData);
}

export async function sendDryRunGameMessage(tags: { name: string; value: string }[], process: "game" | "combat" = "game") {
  const action = tags.find((tag) => tag.name === "Action")?.value;
  console.log("sending dry run message:" + action, { tags });
  const resultData = (await dryrun({
    process: process === "game" ? GAME_PROCESS_ID : COMBAT_PROCESS_ID,
    tags: tags,
    signer: createDataItemSigner(window.arweaveWallet),
  })) as MessageResult;

  console.log("got result: " + action, { resultData });
  return handleResultData(resultData);
}

function handleResultData(resultData: MessageResult): MyMessageResult {
  const newResultData = { ...resultData, data: {}, status: undefined } as MyMessageResult;

  if (resultData.Messages.length > 0 && resultData.Messages[0].Data) {
    const message = resultData.Messages[0];
    const tags = message.Tags;
    const status = tags.find((tag: { name: string; value: string }) => tag.name === "Status")?.value;
    const data = JSON.parse(message.Data);
    newResultData.data = data;
    if (status) {
      newResultData.status = status;
      if (status === "Success") {
        return newResultData;
      } else {
        // throw new Error(data.message);
        // TODO: show error notification toast
      }
    } else {
      // TODO: can check for assert errors here
    }
  }
  return newResultData;
}
