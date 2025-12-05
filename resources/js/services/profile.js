import api from "./http";

export const getProfile = () =>
    api.get("/profile").then((r) => r.data?.data?.user || r.data?.user || r.data);

export const updateProfile = (payload) =>
    api.put("/profile", payload).then((r) => r.data?.data?.user || r.data?.user);

export const changePassword = async (payload) => {
  try {
    const res = await api.put("/profile/password", payload);
    return res.data;
  } catch (err) {
    console.error("Change password error response:", err.response?.data);

    if (err.response?.data?.errors) {
      const errorMessages = [];
      for (const field in err.response.data.errors) {
        errorMessages.push(err.response.data.errors[field].join(", "));
      }
      throw new Error(errorMessages.join("; "));
    }

    throw new Error(err.response?.data?.message || err.message || "change_password_failed");
  }
};
