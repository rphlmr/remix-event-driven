import { useFetcher, useLoaderData } from "@remix-run/react";
import { eq } from "drizzle-orm";

import { db } from "~/database/db.server";
import { order } from "~/database/schema";
import { emitter } from "~/modules/events/emitter";

import { useNotificationEvent } from "./sse";

export async function loader() {
  const orders = await db.query.order.findMany({
    orderBy: (order, { desc }) => [desc(order.createdAt)],
  });

  return { orders };
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const actionType = formData.get("actionType");

  // fake auto system
  if (actionType === "create-order") {
    new Promise((resolve) =>
      setTimeout(async () => {
        void db
          .insert(order)
          .values({})
          .returning()
          .then(async ([newOrder]) => {
            await new Promise((resolve) =>
              setTimeout(async () => {
                emitter.send({
                  type: "notify.order.created",
                  payload: newOrder,
                });
                resolve(true);
              }, 500)
            );

            await new Promise((resolve) =>
              setTimeout(async () => {
                const [updatedOrder] = await db
                  .update(order)
                  .set({ status: "processing" })
                  .where(eq(order.id, newOrder.id))
                  .returning();
                emitter.send({
                  type: "notify.order.updated",
                  payload: updatedOrder,
                });
                resolve(true);
              }, Math.random() * 1000 * 5)
            );
          });
        resolve(true);
      }, 1000)
    );
  }

  return { success: true };
}

export default function Index() {
  const { orders } = useLoaderData<typeof loader>();
  const fetcher = useFetcher<typeof action>();
  const notification = useNotificationEvent();

  if (notification.type === "notify.order.created") {
    if (!orders.find((order) => order.id === notification.payload.id)) {
      orders.unshift(notification.payload);
    }
  }

  if (notification.type === "notify.order.updated") {
    const order = orders.find((order) => order.id === notification.payload.id);
    if (order) {
      order.status = notification.payload.status;
      order.updatedAt = notification.payload.updatedAt;
    }
  }

  return (
    <div>
      <h1>Orders</h1>
      <div>
        <button
          className="rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700"
          type="button"
          onClick={() =>
            fetcher.submit({ actionType: "create-order" }, { method: "post" })
          }
        >
          Create order
        </button>
      </div>
      <ul className="max-w-xl space-y-4 overflow-y-auto p-4">
        {orders.map((order) => (
          <li key={order.id} className="rounded-lg bg-white p-4 shadow-md">
            <div className="flex flex-col space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-lg font-semibold text-gray-800">
                  ID: {order.id}
                </span>
                <span
                  className={`rounded-full px-2 py-1 text-xs font-medium ${
                    order.status === "delivered"
                      ? "bg-green-100 text-green-800"
                      : order.status === "pending"
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {order.status}
                </span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <div>
                  <span className="font-medium">Created:</span>{" "}
                  {order.createdAt
                    ? new Date(order.createdAt).toLocaleString()
                    : "N/A"}
                </div>
                <div>
                  <span className="font-medium">Updated:</span>{" "}
                  {order.updatedAt
                    ? new Date(order.updatedAt).toLocaleString()
                    : "N/A"}
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
