import { CssBaseline, Container } from "@mui/material";
import FlightSearch from "./components/FlightSearch";

const App = () => {
  return (
    <div>
      <CssBaseline />
      <Container maxWidth="lg">
        <FlightSearch />
      </Container>
    </div>
  );
};

export default App;
