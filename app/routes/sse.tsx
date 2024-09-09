import { useEventSource } from "remix-utils/sse/react";
import { eventStream } from "remix-utils/sse/server";

import { emitter, type Event } from "~/modules/events/emitter";

type EventType = "notification";
type SendFunction = (args: { event: EventType; data: string }) => void;

export function loader({ request }: LoaderFunctionArgs) {
  const abortController = new AbortController();
  abortController.signal.addEventListener("abort", () =>
    abortController.abort()
  );

  return eventStream(
    AbortSignal.any([request.signal, abortController.signal]),
    (send: SendFunction) => {
      const listener = emitter.on("*", (event: Event) => {
        try {
          console.log("Sending event", event);
          send({
            event: "notification",
            data: JSON.stringify(event),
          });
        } catch (cause) {
          if (
            cause instanceof Error &&
            !cause.message.includes("Controller is already closed")
          ) {
            console.error("Failed to send SSE notification", cause);
          }
        }
      });

      return () => {
        listener.unsubscribe();
      };
    }
  );
}

export function useNotificationEvent() {
  const event = useEventSource("sse", {
    event: "notification" satisfies EventType,
  });

  return JSON.parse(event || "{}") as Event;
}
