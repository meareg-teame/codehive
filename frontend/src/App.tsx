import { AuthProvider } from "@/app/providers/AuthProvider";
import { SocketProvider } from "@/app/providers/SocketProvider";
import { AppRouter } from "@/app/router";

function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <AppRouter />
      </SocketProvider>
    </AuthProvider>
  );
}

export default App;
