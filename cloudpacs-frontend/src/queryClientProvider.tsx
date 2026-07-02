import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query'
import axios from "axios";


const instance = axios.create({
  baseURL: "http://localhost:5173/",
  timeout: 5000,
  headers: { "X-Custom-Header": "foobar" },
});

const queryClient = new QueryClient()

function App() {
  return <QueryClientProvider client={queryClient}> // makes queryClient available to everything in between
      ...Routes
      <TestFetch />
    </QueryClientProvider>
}

function TestFetch() {
  const { data, error, isLoading, isError } = useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      const res = await instance.get("users")
      return res.data
    },
  })

  if (isLoading) return <p>Loading...</p>
  if (isError) return <p>Error: {error.message}</p>

  return <pre>{JSON.stringify(data, null, 2)}</pre>
}

export default App;