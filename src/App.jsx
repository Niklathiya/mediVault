import { DarkModeProvider } from './context/DarkModeContext';
import { RBACProvider } from './context/RBACContext';
import AppRoutes from './routes/AppRoutes';

function App() {
  return (
    <DarkModeProvider>
      <RBACProvider>
        <AppRoutes />
      </RBACProvider>
    </DarkModeProvider>
  );
}

export default App;
