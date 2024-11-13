import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Icono personalizado para el marcador de Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const Index = () => {
  const navigate = useNavigate();
  const [images, setImages] = useState([]);
  const [error, setError] = useState('');
  const [gpsLocation, setGpsLocation] = useState({ latitude: null, longitude: null });

  // Función para cerrar sesión
  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  // Solicitar ubicación al cargar la página
  useEffect(() => {
    requestLocation();
  }, []);

  // Función para solicitar la ubicación
  const requestLocation = async () => {
    try {
      const location = await getLocation();
      setGpsLocation(location);
      setError('');
    } catch (err) {
      setError('No se pudo obtener la ubicación. Activa los permisos de ubicación.');
    }
  };

  // Función para obtener la ubicación actual
  const getLocation = () => {
    return new Promise((resolve, reject) => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            resolve({ latitude, longitude });
          },
          (error) => reject(error),
          { enableHighAccuracy: true, timeout: 5000 }
        );
      } else {
        reject(new Error('Geolocalización no es compatible'));
      }
    });
  };

  return (
    <div className="flex flex-col h-screen items-center justify-center p-4">
      <h1 className="text-4xl font-bold mb-4">Captura de Imágenes</h1>
      
      <form className="bg-white p-6 rounded-lg shadow-md w-full max-w-md">
        <label className="block text-gray-700 text-lg font-semibold mb-4">
          Captura Imágenes con la Cámara
        </label>

        <input
          type="file"
          accept="image/*"
          capture="environment" // Usa la cámara
          className="block w-full text-gray-600 border rounded-lg p-2 mb-4 focus:outline-none"
        />

        {/* Campo de GPS */}
        <label className="block text-gray-700 text-sm font-semibold mb-2">
          Ubicación GPS:
        </label>
        <input
          type="text"
          value={`Lat: ${gpsLocation.latitude || 'Esperando...'}, Lng: ${gpsLocation.longitude || 'Esperando...'}`}
          readOnly
          className="block w-full text-gray-600 border rounded-lg p-2 mb-4 bg-gray-100"
        />

        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

        {/* Mapa de Leaflet */}
        {gpsLocation.latitude && gpsLocation.longitude && (
          <MapContainer
            center={[gpsLocation.latitude, gpsLocation.longitude]}
            zoom={15}
            style={{ height: '300px', width: '100%', marginTop: '1rem' }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            <Marker position={[gpsLocation.latitude, gpsLocation.longitude]}>
              <Popup>
                Estás aquí: <br /> Lat: {gpsLocation.latitude}, Lng: {gpsLocation.longitude}
              </Popup>
            </Marker>
          </MapContainer>
        )}

        <button
          type="button"
          onClick={handleLogout}
          className="mt-6 w-full bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 transition-colors duration-300"
        >
          Cerrar Sesión
        </button>
      </form>
    </div>
  );
};

export default Index;
