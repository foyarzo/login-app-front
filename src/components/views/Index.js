import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Index = () => {
  const navigate = useNavigate();
  const [images, setImages] = useState([]);
  const [error, setError] = useState('');
  const [gpsLocation, setGpsLocation] = useState({ latitude: '', longitude: '' });

  // Función para cerrar sesión
  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  // Verificar y solicitar permisos de ubicación al cargar la página
  useEffect(() => {
    checkLocationPermission();
  }, []);

  // Función para verificar los permisos de ubicación
  const checkLocationPermission = async () => {
    if ('permissions' in navigator) {
      try {
        const permissionStatus = await navigator.permissions.query({ name: 'geolocation' });
        if (permissionStatus.state === 'granted') {
          // Permiso ya otorgado, obtenemos la ubicación
          requestLocation();
        } else if (permissionStatus.state === 'prompt') {
          // Solicitamos permiso de ubicación
          requestLocation();
        } else {
          // Permiso denegado
          setError('Permisos de ubicación denegados. Actívalos en la configuración de tu dispositivo.');
        }
        permissionStatus.onchange = () => {
          if (permissionStatus.state === 'granted') {
            requestLocation();
          } else {
            setError('Permisos de ubicación denegados. Actívalos en la configuración de tu dispositivo.');
          }
        };
      } catch (err) {
        setError('No se pudo verificar el permiso de ubicación. Intenta activarlo manualmente.');
      }
    } else {
      // Si el navegador no soporta `navigator.permissions`, intentamos solicitar la ubicación directamente
      requestLocation();
    }
  };

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

  // Función para manejar la captura de imagen
  const handleCapture = async (event) => {
    const file = event.target.files[0];
    if (file) {
      const timestamp = new Date(file.lastModified);
      const url = URL.createObjectURL(file);

      try {
        // Agregar la nueva imagen con su información
        const location = gpsLocation.latitude && gpsLocation.longitude ? gpsLocation : await getLocation();
        setImages((prevImages) => [...prevImages, { url, timestamp, location }]);
        setError('');
      } catch (err) {
        setError('No se pudo obtener la ubicación. Activa los permisos de ubicación.');
      }
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

        <button
          type="button"
          onClick={requestLocation}
          className="block w-full bg-blue-500 text-white py-2 rounded-lg mb-4 hover:bg-blue-600 transition-colors duration-300"
        >
          Obtener ubicación
        </button>

        <input
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleCapture}
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

        {images.length > 0 && (
          <div className="mt-6 space-y-4">
            {images.map((image, index) => (
              <div key={index} className="border p-4 rounded-lg bg-gray-50">
                <img
                  src={image.url}
                  alt={`Captured ${index + 1}`}
                  className="w-full h-32 object-cover rounded-lg mb-2"
                />
                <p className="text-gray-700">
                  <span className="font-semibold">Fecha y Hora:</span> {image.timestamp.toLocaleString()}
                </p>
                <p className="text-gray-700">
                  <span className="font-semibold">Ubicación:</span> Lat {image.location.latitude}, Lng {image.location.longitude}
                </p>
              </div>
            ))}
          </div>
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
