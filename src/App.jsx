import { DarkModeProvider } from './context/DarkModeContext';
import AppRoutes from './routes/AppRoutes';

function App() {
  return (
    <DarkModeProvider>
      <AppRoutes />
    </DarkModeProvider>
  );
}

export default App;
