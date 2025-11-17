import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import axios from 'axios';
import 'leaflet/dist/leaflet.css';
import airplaneIconUrl from './assets/airplane-icon.png';

const airplaneIcon = new L.Icon({
    iconUrl: airplaneIconUrl,
    iconSize: [25, 25],
});

const FlightMap = () => {
    const [flights, setFlights] = useState([]);
    const bounds = [
        [-33.742, -73.985], // sudoeste do Brasil
        [5.271, -34.793] // nordeste do Brasil
    ];

    const fetchFlights = async () => {
        try {
            const response = await axios.get('https://opensky-network.org/api/states/all', {
                params: {
                    lamin: bounds[0][0],
                    lomin: bounds[0][1],
                    lamax: bounds[1][0],
                    lomax: bounds[1][1],
                },
                headers: {
                    'Authorization': 'Basic ' + btoa('letto:@Ap25623102')
                }
            });
            console.log("Dados recebidos:", response.data.states);
            setFlights(response.data.states);
        } catch (error) {
            console.error("Erro ao buscar dados de voo:", error);
        }
    };

    useEffect(() => {
        fetchFlights();
        // Atualiza a cada 3 segundos
        const intervalId = setInterval(fetchFlights, 3000);
        return () => clearInterval(intervalId);
    }, []);

    return (
        <div style={{ height: '100vh', width: '100%' }}>
            <MapContainer center={[-23.55052, -46.633308]} zoom={7} style={{ height: '100%', width: '100%' }}>
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                {flights && flights.length > 0 && flights.map((flight, idx) => (
                    flight[5] !== null && flight[6] !== null && (
                        <Marker
                            key={idx}
                            position={[flight[6], flight[5]]}
                            icon={airplaneIcon}
                        >
                            <Popup>
                                ICAO24: {flight[0]}<br />
                                Callsign: {flight[1]}<br />
                                Altitude: {flight[7]}m<br />
                                Velocity: {flight[9]}m/s
                            </Popup>
                        </Marker>
                    )
                ))}
            </MapContainer>
        </div>
    );
};

export default FlightMap;
