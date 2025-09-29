import { isoToLocalYMD } from "./dates"; 

function pickYMD(val) {
    if (!val) return "";
    const m = String(val).match(/^\d{4}-\d{2}-\d{2}/);
    return m ? m[0] : "";
}

function looksISODateTime(s) {
    return typeof s === "string" && /T\d{2}:\d{2}/.test(s);
}

export const CAT_API_TO_UI = {
    emergency_fund: "Emergencia",
    education: "Educación",
    vacation: "Vacaciones",
    home: "Hogar",
    car: "Vehículo",
    wedding: "Boda",
    business: "Negocio",
    retirement: "Jubilación",
    health: "Salud",
    others: "Otros",
};

export const CAT_UI_TO_API = Object.fromEntries(
    Object.entries(CAT_API_TO_UI).map(([api, ui]) => [ui, api])
);

export const CATEGORIES_UI = [
    "Emergencia",
    "Educación",
    "Vacaciones",
    "Hogar",
    "Vehículo",
    "Boda",
    "Negocio",
    "Jubilación",
    "Salud",
    "Otros",
];

export const STATUS_API_TO_UI = {
    active: "Activa",
    completed: "Completada",
    expired: "Vencida",
};

export const STATUS_UI_TO_API = {
    Activa: "active",
    Completada: "completed",
    Vencida: "expired",
};

export function goalApiToUi(api) {
    const statusUI = STATUS_API_TO_UI[api.status] ?? "Activa";

    const createdAt = looksISODateTime(api.created_at)
        ? isoToLocalYMD(api.created_at)
        : pickYMD(api.created_at);

    const updatedAt = looksISODateTime(api.updated_at)
        ? isoToLocalYMD(api.updated_at)
        : pickYMD(api.updated_at);

    const finishedAt = api.completed_at
        ? (looksISODateTime(api.completed_at) ? isoToLocalYMD(api.completed_at) : pickYMD(api.completed_at))
        : (api.status === "completed" ? updatedAt : "");

    return {
        id: api.id,
        name: api.name,
        category: CAT_API_TO_UI[api.category] ?? "Otros",
        description: api.description ?? "",
        targetAmount: Number(api.target_amount),
        currentAmount: Number(
            api.accumulated ?? api.current_amount ?? api.currentAmount ?? 0
        ),
        status: statusUI,

        createdAt,                
        updatedAt,                
        deadline: pickYMD(api.target_date), 
        finishedAt,            
    };
}

export function goalUiToApi(ui) {
    const payload = {
        name: ui.name?.trim() ?? "",
        category: CAT_UI_TO_API[ui.category] ?? "others",
        description: ui.description?.trim() || null,
        target_amount: Number(ui.targetAmount),
        target_date: ui.deadline,
    };

    if (ui.status) {
        payload.status = STATUS_UI_TO_API[ui.status] ?? "active";
    }

    return payload;
}
