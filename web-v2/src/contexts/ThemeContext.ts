import { createTheme } from "@mui/material";

const theme = createTheme({
  palette: {
    primary: {
      main: "#eee",
    },
  },
  typography: {
    fontFamily: "Quicksand",
    fontWeightLight: 400,
    fontWeightregular: 500,
    fontWeightMedium: 600,
    fontWeightBold: 700,
  },
});

const ThemeContextProvider = ({ children }) => {
  return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
};

export default ThemeContextProvider;
