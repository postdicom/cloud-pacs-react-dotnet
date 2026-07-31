export async function useStudies() {
    const response = await fetch("https://localhost/5001/studies", {
        method: "GET"
    })
    return response;
}