import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter, Route, Routes } from "react-router-dom";

import InitialPage from "./pages/InitialPage";
import NotFoundPage from "./pages/NotFoundPage";

function App() {
    return (
        <BrowserRouter>
        <Routes>
            <Route path="/" element={<InitialPage/>}/>
            <Route path="*" element={<NotFoundPage/>} />
        </Routes>
        </BrowserRouter>
    )
}
export default App