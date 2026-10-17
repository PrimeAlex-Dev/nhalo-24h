import { AppRouter } from './routes';
import { AuthProvider } from './features/auth';

export function App() {
  return (
    <AuthProvider>
      <AppRouter />
    </AuthProvider>
  );
}

export default App;

