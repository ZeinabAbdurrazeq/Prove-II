import axiosInstance from "../lib/axios";

export const subscriptionApi = {
  getMySubscription: async () => {
    const response = await axiosInstance.get("/subscription/me");
    return response.data;
  },

  simulatePayment: async ({ plan, cardNumber }) => {
    const response = await axiosInstance.post("/subscription/simulate-payment", {
      plan,
      cardNumber,
    });
    return response.data;
  },

  createPaypalOrder: async ({ plan }) => {
    const response = await axiosInstance.post("/subscription/paypal/create-order", {
      plan,
    });
    return response.data;
  },

  capturePaypalOrder: async ({ plan, orderId }) => {
    const response = await axiosInstance.post("/subscription/paypal/capture-order", {
      plan,
      orderId,
    });
    return response.data;
  },

  cancelSubscription: async () => {
    const response = await axiosInstance.post("/subscription/cancel");
    return response.data;
  },

  checkLimit: async () => {
    const response = await axiosInstance.get("/subscription/check-limit");
    return response.data;
  },
};
