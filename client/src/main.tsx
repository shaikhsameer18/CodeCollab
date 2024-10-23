import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import AppProvider from "./context/AppProvider.tsx";
import "@/styles/global.css";

// Create root element and render the app within the context provider
ReactDOM.createRoot(document.getElementById("root")!).render(
    <AppProvider>
        <App />
    </AppProvider>
);
