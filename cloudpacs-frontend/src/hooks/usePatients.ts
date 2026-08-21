import { API_BASE_URL } from "../config";

export async function usePatients() {
    const response = await fetch(`${API_BASE_URL}/patients`, {
        method: "GET"
    })
    return response;
}