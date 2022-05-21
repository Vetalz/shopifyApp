import {applyMiddleware, createStore} from "redux";
import {reducer} from "./reducer/reducer.js";
import axios from "axios";
import axiosMiddleware from "redux-axios-middleware";
import createApp from "@shopify/app-bridge";
import {getSessionToken} from "@shopify/app-bridge-utils";


const app = createApp({
  apiKey: process.env.SHOPIFY_API_KEY,
  host: new URL(location).searchParams.get("host"),
  forceRedirect: true,
});

const client = axios.create({
  baseURL: '/products',
  responseType: 'json'
});

client.interceptors.request.use(function (config) {
  return getSessionToken(app)
    .then((token) => {
      config.headers["Authorization"] = `Bearer ${token}`;
      return config;
    });
});

export const store = createStore(reducer, applyMiddleware(axiosMiddleware(client)));