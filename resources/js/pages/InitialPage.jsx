import { useEffect } from "react"
import api from "../API";

function InitialPage() {
    useEffect(()=>{
        const fetchSamples = async () => {
            const samples = await api.get('/sample')
            console.log(samples.data)
        } 
        fetchSamples()
    }, [])
    return (
        <h1>Papu</h1>
    )
}
export default InitialPage