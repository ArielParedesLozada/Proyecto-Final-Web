import api from "./http";

export const getProfile = () =>
    api.get("/profile").then((r) => r.data?.data?.user || r.data?.user || r.data);

export const updateProfile = (payload) =>
    api.put("/profile", payload).then((r) => r.data?.data?.user || r.data?.user);

export const changePassword = (payload) =>
    api.put("/profile/password", payload).then((r) => r.data);
