import {
  type LoaderFunctionArgs as RR_LoaderFunctionArgs,
  type ActionFunctionArgs as RR_ActionFunctionArgs,
  type AppLoadContext as RemixAppLoadContext,
} from "@remix-run/node";
import {
  type ClientLoaderFunctionArgs as RR_ClientLoaderFunctionArgs,
  type ClientActionFunctionArgs as RR_ClientActionFunctionArgs,
} from "@remix-run/react";

declare global {
  export type LoaderFunctionArgs = Required<RR_LoaderFunctionArgs>;
  export type ActionFunctionArgs = Required<RR_ActionFunctionArgs>;
  export type ClientLoaderFunctionArgs = RR_ClientLoaderFunctionArgs;
  export type ClientActionFunctionArgs = RR_ClientActionFunctionArgs;
  export type AppLoadContext = RemixAppLoadContext;
}
