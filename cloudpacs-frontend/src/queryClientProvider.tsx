import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query'
import axios from "axios";

//whwenever something is called (user) it will beadded to the end of the url: http://localhost:5173/users
const instance = axios.create({
  baseURL: "http://localhost:5173/",
  timeout: 5000,
  headers: { "X-Custom-Header": "foobar" },
});

// holds the cache of all fetched data
const queryClient = new QueryClient()

function App() {
  return <QueryClientProvider client={queryClient}> // makes queryClient available to everything in between
      ...Routes
      <TestFetch />
    </QueryClientProvider>
}

// Test component that sends out a request
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

/* function Users() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['users'],
    queryFn: () => instance.get('/users').then(res => res.data),
  });

  if (isLoading) return <p>Loading...</p>;
  if (error) return <p>Error!</p>;

  return <ul>{data.map(u => <li key={u.id}>{u.name}</li>)}</ul>;
}

function Clients() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['clients'],
    queryFn: () => instance.get<Client[]>('/users/clients/').then(res => res.data),
  });

  if (isLoading) return <p>Loading...</p>;
  if (error) return <p>Error!</p>;

  return (
    <ul>
      {data?.map(c => <li key={c.id}>{c.name}</li>)}
    </ul>
)}; */