export async function usePatients() {
    const response = await fetch("https://localhost/5000/patients", {
        method: "GET"
    })
    return response;
}