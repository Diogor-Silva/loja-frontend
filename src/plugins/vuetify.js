import "vuetify/styles";
import "@mdi/font/css/materialdesignicons.css";

import { createVuetify } from "vuetify";
import * as components from "vuetify/components";
import * as directives from "vuetify/directives";
import { aliases, mdi } from "vuetify/iconsets/mdi";
import { pt } from "vuetify/locale";

const vuetify = createVuetify({
    components,
    directives,

    icons: {
        defaultSet: "mdi",
        aliases,
        sets: {
            mdi,
        },
    },

    locale: {
        locale: "pt",
        fallback: "pt",
        messages: {
            pt,
        },
    },

    theme: {
        defaultTheme: "lojaTheme",

        themes: {
            lojaTheme: {
                dark: false,

                colors: {
                    primary: "#00BFA5",
                    secondary: "#121212",
                    accent: "#26C6DA",
                    background: "#F4F7F6",
                    surface: "#FFFFFF",
                    error: "#D32F2F",
                    success: "#2E7D32",
                    warning: "#F9A825",
                },
            },
        },
    },
});

export default vuetify;