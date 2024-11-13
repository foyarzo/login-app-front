import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import Modal from 'react-modal';

// Icono personalizado para el marcador de Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Estilos para el modal
Modal.setAppElement('#root');
const modalStyles = {
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
    maxHeight: '80vh',
    overflow: 'auto'
  }
};

const Index = () => {
  const navigate = useNavigate();
  const [images, setImages] = useState([]);
  const [error, setError] = useState('');
  const [gpsLocation, setGpsLocation] = useState({ latitude: null, longitude: null });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const fileInputRef = useRef(null); // Referencia para el input de archivos

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

  // Función para manejar la captura de imagen
  const handleCapture = async (event) => {
    // Primero, solicitar la ubicación
    try {
      const location = await getLocation();
      setGpsLocation(location);

      // Abre el selector de archivos solo si se obtiene la ubicación
      fileInputRef.current.click(); // Activa el input de archivo programáticamente
    } catch (err) {
      setError('Activa los permisos de ubicación para continuar.');
    }
  };

  // Función para manejar el archivo una vez que se selecciona
  const handleFileChange = (event) => {
    const files = Array.from(event.target.files);
    const newImages = files.map((file) => ({
      url: URL.createObjectURL(file),
      timestamp: new Date(file.lastModified),
    }));
    setImages((prevImages) => [...prevImages, ...newImages]);
  };

  // Función para abrir el modal
  const openModal = () => {
    setIsModalOpen(true);
  };

  // Función para cerrar el modal
  const closeModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div className="flex flex-col h-screen items-center justify-center p-4">
      <h1 className="text-4xl font-bold mb-4">Captura de Imágenes</h1>
      
      <form className="bg-white p-6 rounded-lg shadow-md w-full max-w-md">
        <label className="block text-gray-700 text-lg font-semibold mb-4">
          Captura Imágenes con la Cámara
        </label>

        {/* Botón para capturar imagen */}
        <button
          type="button"
          onClick={handleCapture}
          className="block w-full bg-blue-500 text-white py-2 rounded-lg mb-4 hover:bg-blue-600 transition-colors duration-300"
        >
          Capturar Imagen
        </button>

        {/* Input de archivo oculto */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          multiple
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />

        {/* Botón para abrir el modal si hay varias imágenes */}
        {images.length > 1 && (
          <button
            type="button"
            onClick={openModal}
            className="block w-full bg-blue-500 text-white py-2 rounded-lg mb-4 hover:bg-blue-600 transition-colors duration-300"
          >
            Ver todas las imágenes ({images.length})
          </button>
        )}

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

      {/* Modal para mostrar imágenes agrupadas */}
      <Modal
        isOpen={isModalOpen}
        onRequestClose={closeModal}
        style={modalStyles}
        contentLabel="Modal de imágenes"
      >
        <h2 className="text-2xl font-semibold mb-4">Imágenes capturadas</h2>
        <button
          onClick={closeModal}
          className="bg-red-500 text-white py-1 px-3 rounded-lg mb-4 hover:bg-red-600 transition-colors duration-300"
        >
          Cerrar
        </button>
        <div className="grid grid-cols-2 gap-4">
          {images.map((image, index) => (
            <div key={index} className="border p-2 rounded-lg">
              <img
                src={image.url}
                alt={`Captured ${index + 1}`}
                className="w-full h-32 object-cover rounded-lg"
              />
              <p className="text-gray-700 text-xs mt-2">
                {image.timestamp.toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      </Modal>
    </div>
  );
};

export default Index;
