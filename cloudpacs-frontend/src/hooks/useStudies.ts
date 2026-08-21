import { API_BASE_URL } from "../config";

export async function useStudies() {
    const response = await fetch(`${API_BASE_URL}/studies`, {
        method: "GET"
    })
    return response;
}