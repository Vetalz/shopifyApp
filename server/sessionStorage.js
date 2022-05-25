import {SessionModel} from "./models/SessionModel.js";
import {Session} from "@shopify/shopify-api/dist/auth/session/index.js";


export const storeCallback = async (session) => {
  const result = await SessionModel.findOne({id:session.id});
  if (result) {
    await SessionModel.findOneAndUpdate(
      {id: session.id},
      {
        allInfo: session,
        shop: session.shop,
      }
    );
  } else {
    await SessionModel.create({
      id: session.id,
      allInfo: session,
      shop: session.shop,
    });
  }

  return true;
}

export const loadCallback = async (id) => {
  const sessionResult = await  SessionModel.findOne({id});

  if (sessionResult) {
    let session = sessionResult.allInfo;
    return Session.cloneSession(session, session.id);
  }
  return undefined
}

export const deleteCallback = async (id) => {
  await SessionModel.deleteMany({id});
  return true;
}