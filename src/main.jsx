import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Provider } from 'react-redux'
import './index.css'
import MainRouter from './Routers/MainRouter'
import store from './Redux/Store/store'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

createRoot(document.getElementById('root')).render(
    <StrictMode>
        <Provider store={store}>
            <BrowserRouter>
                <MainRouter />
                <ToastContainer position="top-right" autoClose={3000} />
            </BrowserRouter>
        </Provider>
    </StrictMode>
)