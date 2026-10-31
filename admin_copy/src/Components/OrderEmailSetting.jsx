import { useEffect, useState } from "react";
import axios from "axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { backendUrl } from "../App";

const OrderEmailSetting = ({ token }) => {
  const queryClient = useQueryClient();
  const headers = { Authorization: `Bearer ${token}` };
  const url = `${backendUrl}/api/orders/notification-email`;

  const { data } = useQuery({
    queryKey: ["orderNotificationEmail"],
    queryFn: async () => (await axios.get(url, { headers })).data,
  });

  const [email, setEmail] = useState("");

  useEffect(() => {
    if (data) setEmail(data.email);
  }, [data]);

  const save = useMutation({
    mutationFn: () => axios.put(url, { email }, { headers }),
    onSuccess: () => {
      toast.success("Order email saved");
      queryClient.invalidateQueries({ queryKey: ["orderNotificationEmail"] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Could not save the order email");
    },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        save.mutate();
      }}
      className="mb-6"
    >
      <label htmlFor="order-email" className="block mb-2 font-semibold">
        Order Notification Email
      </label>
      <div className="flex flex-wrap gap-2">
        <input
          id="order-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          maxLength={254}
          required
          className="border p-2 w-full max-w-[350px]"
        />
        <button
          type="submit"
          disabled={save.isPending || !data || email.trim().toLowerCase() === data.email}
          className="bg-black text-white px-6 py-2 rounded cursor-pointer disabled:opacity-50 disabled:cursor-default"
        >
          {save.isPending ? "Saving..." : "Save"}
        </button>
      </div>
      <p className="text-xs text-gray-500 mt-1">
        A new order alert goes to this address.
      </p>
      {data && !data.emailConfigured && (
        <p className="text-xs text-red-500 mt-1">
          Emails cannot be sent yet: the mail account (SMTP) is not set up on the server.
        </p>
      )}
    </form>
  );
};

export default OrderEmailSetting;
