export async function usePatients() {
    const response = await fetch("https://localhost/5001/patients", {
        method: "GET"
    })
    return response;
}