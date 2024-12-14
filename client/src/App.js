import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CssBaseline, ThemeProvider } from '@mui/material'
import { indigo, amber } from '@mui/material/colors'
import { createTheme } from "@mui/material/styles";
import HomePage from './pages/HomePage';
import PropertySearch from './pages/PropertySearch';
import CrimeMap from './pages/CrimeMap';
import Insights from "./pages/Insights";

export const theme = createTheme({
  palette: {
    primary: indigo,
    secondary: amber,
  },
});

// import StreetAnalysis from './pages/StreetAnalysis';
// import InvestmentScores from './pages/InvestmentScores';

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/property-search" element={<PropertySearch />} />
          <Route path="/crime-map" element={<CrimeMap />} />
          <Route path="/insights" element={<Insights />} />;
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}
