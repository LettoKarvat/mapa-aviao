import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import axios from 'axios';
import 'leaflet/dist/leaflet.css';
import airplaneIconUrl from './assets/airplane-icon.png';
import './FlightMap.css';

const airplaneIcon = new L.Icon({
    iconUrl: airplaneIconUrl,
    iconSize: [30, 30],
});

const FlightMap = () => {
    const [flights, setFlights] = useState([]);
    const [loading, setLoading] = useState(true);
    const [lastUpdate, setLastUpdate] = useState(null);

    const bounds = [
        [-33.742, -73.985],
        [5.271, -34.793]
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
            setFlights(response.data.states || []);
            setLastUpdate(new Date());
            setLoading(false);
        } catch (error) {
            console.error("Erro ao buscar dados de voo:", error);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFlights();
        const intervalId = setInterval(fetchFlights, 10000); // 10 segundos
        return () => clearInterval(intervalId);
    }, []);

    return (
        <div className="flight-tracker-container">
            {/* Header */}
            <div className="header">
                <div className="header-content">
                    <h1>🛩️ Rastreador de Voos - Brasil</h1>
                    <div className="flight-count">
                        <span className="pulse-dot"></span>
                        {flights.length} voos ao vivo
                    </div>
                </div>
            </div>

            {/* Loading */}
            {loading && (
                <div className="loading-overlay">
                    <div className="loading-spinner"></div>
                    <p>Carregando dados de voo...</p>
                </div>
            )}

            {/* Mapa */}
            <MapContainer
                center={[-15.7801, -47.9292]}
                zoom={5}
                style={{ height: '100%', width: '100%' }}
                zoomControl={true}
            >
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; OpenStreetMap contributors'
                />
                {flights && flights.length > 0 && flights.map((flight, idx) => (
                    flight[5] !== null && flight[6] !== null && (
                        <Marker
                            key={idx}
                            position={[flight[6], flight[5]]}
                            icon={airplaneIcon}
                        >
                            <Popup>
                                <div className="popup-content">
                                    <strong>✈️ {flight[1]?.trim() || 'N/A'}</strong>
                                    <hr />
                                    <p><strong>ICAO24:</strong> {flight[0]}</p>
                                    <p><strong>Altitude:</strong> {flight[7] ? `${Math.round(flight[7])}m` : 'N/A'}</p>
                                    <p><strong>Velocidade:</strong> {flight[9] ? `${Math.round(flight[9] * 3.6)} km/h` : 'N/A'}</p>
                                    <p><strong>País:</strong> {flight[2] || 'N/A'}</p>
                                </div>
                            </Popup>
                        </Marker>
                    )
                ))}
            </MapContainer>

            {/* Info Panel */}
            <div className="info-panel">
                <div className="info-item">
                    <span className="info-label">Última atualização:</span>
                    <span className="info-value">
                        {lastUpdate ? lastUpdate.toLocaleTimeString('pt-BR') : '--:--:--'}
                    </span>
                </div>
                <div className="info-item">
                    <span className="info-label">Área monitorada:</span>
                    <span className="info-value">Brasil</span>
                </div>
            </div>

            {/* Footer com Créditos */}
            <div className="footer">
                <div className="credits">
                    <div className="credits-icon">🎓</div>
                    <div className="credits-text">
                        <strong>Desenvolvido por Isabelly</strong>
                        <p>Sistemas de Informações Geográficas - UDESC</p>
                        <p className="credits-subtitle">Universidade do Estado de Santa Catarina</p>
                    </div>
                </div>
                <div className="tech-stack">
                    <span className="tech-badge">React</span>
                    <span className="tech-badge">Leaflet</span>
                    <span className="tech-badge">OpenSky API</span>
                </div>
            </div>
        </div>
    );
};

export default FlightMap;