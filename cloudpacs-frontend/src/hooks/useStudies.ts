export async function useStudies() {
    const response = await fetch("https://localhost/5000/studies", {
        method: "GET"
    })
    return response;
}