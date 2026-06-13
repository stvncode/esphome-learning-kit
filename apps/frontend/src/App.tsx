import { BrowserRouter, Routes, Route } from "react-router-dom"
import { AppShell } from "@/components/layout"
import { Home, Level } from "@/pages"
import { Sandbox } from "@/pages/Sandbox"
import { Workshop } from "@/pages/Workshop"

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppShell />}>
          <Route path="/" element={<Home />} />
          <Route path="/level/:levelId" element={<Level />} />
          <Route path="/sandbox" element={<Sandbox />} />
          <Route path="/workshop" element={<Workshop />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
