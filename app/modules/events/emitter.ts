import { remember } from "@epic-web/remember";
import { createClient } from "@supabase/supabase-js";
import {
  createActor,
  enqueueActions,
  forwardTo,
  fromCallback,
  setup,
} from "xstate";

import type { Order } from "~/database/schema";
import { env } from "~/utils/env";

export type Event =
  | { type: "notify.order.created"; payload: Order }
  | { type: "notify.order.updated"; payload: Order };

type SendBackEvent = { type: "emit"; payload: Event };

const PubSub = fromCallback(
  ({
    receive,
    sendBack,
  }: {
    receive: (listener: (event: Event) => void) => void;
    sendBack: (event: SendBackEvent) => void;
  }) => {
    const pubSub = createClient(
      env.SUPABASE_URL,
      env.SUPABASE_SERVICE_ROLE
    ).channel("pub_sub", {
      config: {
        broadcast: {
          self: true,
        },
      },
    });

    pubSub
      .on("broadcast", { event: "*" }, (message) => {
        console.info("Received event from pub_sub", message);

        sendBack({
          type: "emit",
          payload: {
            type: message.event as Event["type"],
            payload: message.payload as Event["payload"],
          },
        });
      })
      .subscribe((status, error) => {
        if (status !== "SUBSCRIBED") {
          throw new Error("Channel not subscribed", error);
        }
      });

    receive((event) => {
      console.info("Received event to dispatch", event);

      pubSub.send({
        type: "broadcast",
        event: event.type,
        payload: event.payload,
      });
    });

    return () => {
      pubSub.unsubscribe();
    };
  }
);

const pubSubActorId = "pub_sub";

const EmitterMachine = setup({
  types: {
    events: {} as Event | SendBackEvent,
    emitted: {} as Event,
  },
  actors: {
    PubSub,
  },
}).createMachine({
  id: "dispatcher",
  invoke: {
    id: pubSubActorId,
    src: "PubSub",
    onError: {
      actions: enqueueActions(({ event }) => {
        console.error(event);
      }),
      target: "#dispatcher",
      reenter: true,
    },
  },
  on: {
    emit: {
      actions: enqueueActions(({ enqueue, event }) => {
        enqueue.emit(event.payload);
      }),
    },
    "*": {
      actions: forwardTo(pubSubActorId),
    },
  },
});

export const emitter = remember("emitter", () => createActor(EmitterMachine));

emitter.start();
