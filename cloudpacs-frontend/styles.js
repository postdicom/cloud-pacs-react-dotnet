import { createTheme } from "@mui/materials/styles";

const theme = createTheme({
    palette: {
        brand: {
            navy: "#0f2d5e",
            navyLight: "#1a3f7a",
            sky: "#0ea5e9",
            skyLight: "#38bdf8",
            skyPale: "#e0f2fe"
        },

        dark:{
            white: "#090e1a",
            surface1: "#111827",
            surface2: "#1f2937",
            border: "#374151"
        },

        light:{
            dark0: "#ffffff",
            dark1: "#f8fafc",
            dark2: "#f1f5f9",
            dark3: "#e2e8f0"
        },

        semantic:{
            success: "#10b981",
            warning: "#f59e0b",
            error: "#ef4444",
            info: "#0ea5e9"
        }
    }
});

export default theme;