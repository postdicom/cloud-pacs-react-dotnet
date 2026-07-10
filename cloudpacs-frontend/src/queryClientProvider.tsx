import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query'
import axios from "axios";


const api = axios.create({
  baseURL: "http://localhost:5071/",
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

// REQUEST interceptor — runs before every request leaves the browser
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config; // must return config or the request is cancelled
});

// RESPONSE interceptor — runs after every response arrives
api.interceptors.response.use(
  (response) => response, // 2xx: pass through unchanged
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token'); // clear stale/expired token
      window.location.replace('/login'); // redirect to login page
    }
    return Promise.reject(error); // re-throw so callers can still catch it
  }
);

function TestFetch() {
  const { data, error, isLoading, isError } = useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      const res = await api.get("users")
      return res.data
    },
  })

  if (isLoading) return <p>Loading...</p>
  if (isError) return <p>Error: {error.message}</p>

  return <pre>{JSON.stringify(data, null, 2)}</pre>
}

export default App;