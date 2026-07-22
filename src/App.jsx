import { Toaster } from "@/components/ui/toaster";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Calculator from "@/pages/Calculator";
import NotFound from "@/pages/NotFound";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Calculator />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Toaster />
    </Router>
  );
}

export default App;
